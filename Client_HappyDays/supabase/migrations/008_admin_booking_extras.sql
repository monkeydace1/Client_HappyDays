-- Migration 008: admin-side extras, locations and deposit flags (CHANGES.md #9, #10, #11)
--
-- Additive only (new nullable / defaulted columns + backfill), so it is safe to run
-- BEFORE the matching frontend is deployed: the old frontend ignores the new columns.
-- The backfill is idempotent (only touches rows where price_per_day IS NULL) →
-- re-run the BACKFILL section on deploy day to catch bookings created in between.

-- ============================================
-- admin_bookings
-- ============================================
ALTER TABLE admin_bookings
  ADD COLUMN IF NOT EXISTS price_per_day INTEGER,
  ADD COLUMN IF NOT EXISTS extras JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS delivery_fee INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS custom_pickup_location TEXT,
  ADD COLUMN IF NOT EXISTS custom_return_location TEXT,
  ADD COLUMN IF NOT EXISTS passport_kept BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deposit_kept BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deposit_amount INTEGER;

COMMENT ON COLUMN admin_bookings.price_per_day IS
  'Vehicle daily rate actually charged (may differ from vehicles.price_per_day). NULL only on rows created by the pre-008 frontend.';
COMMENT ON COLUMN admin_bookings.extras IS
  'Array of {id, name, mode: per_day | one_time, price, quantity}. per_day items bill on rental_days; total_price = price_per_day × rental_days + 3 € × extra_hours + extras + delivery_fee.';
COMMENT ON COLUMN admin_bookings.delivery_fee IS
  'One-time fee (€) for a custom pickup / return location.';
COMMENT ON COLUMN admin_bookings.custom_pickup_location IS
  'Free-text address when pickup_location = ''Autre (préciser)''.';
COMMENT ON COLUMN admin_bookings.custom_return_location IS
  'Free-text address when return_location = ''Autre (préciser)''. return_location NULL = same place as pickup.';
COMMENT ON COLUMN admin_bookings.passport_kept IS 'Agency keeps the client passport during the rental.';
COMMENT ON COLUMN admin_bookings.deposit_kept IS 'Agency holds a deposit (caution) during the rental.';
COMMENT ON COLUMN admin_bookings.deposit_amount IS 'Deposit amount in € (optional).';

-- ============================================
-- bookings (web orders)
-- ============================================
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS custom_return_location TEXT;

COMMENT ON COLUMN bookings.custom_return_location IS
  'Free-text address when return_location = ''Autre (préciser)''.';

-- ============================================
-- BACKFILL (idempotent — re-run on deploy day)
-- ============================================

-- 1) Web bookings: take the rate and the supplements from the client's original order.
--    Supplements were stored as [{id, type, name, pricePerDay, quantity, ...}] plus an
--    additional_driver flag whose rate was 8 €/day until 2026-10-01.
UPDATE admin_bookings ab
SET price_per_day = ROUND(b.vehicle_price_per_day)::int,
    extras = COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
                 'id',       s->>'id',
                 'name',     s->>'name',
                 'mode',     'per_day',
                 'price',    (s->>'pricePerDay')::numeric,
                 'quantity', COALESCE(NULLIF(s->>'quantity', '')::int, 1)))
        FROM jsonb_array_elements(COALESCE(b.supplements, '[]'::jsonb)) s
        WHERE COALESCE(NULLIF(s->>'pricePerDay', '')::numeric, 0) > 0
      ), '[]'::jsonb)
      || CASE WHEN b.additional_driver
              THEN jsonb_build_array(jsonb_build_object(
                     'id', 'additional_driver', 'name', 'Conducteur supplémentaire',
                     'mode', 'per_day', 'price', 8, 'quantity', 1))
              ELSE '[]'::jsonb END,
    custom_pickup_location = COALESCE(ab.custom_pickup_location, b.custom_pickup_location),
    -- the old site stored the return address as free text in bookings.return_location
    return_location = CASE WHEN b.different_return_location AND NULLIF(b.return_location, '') IS NOT NULL
                           THEN 'Autre (préciser)' ELSE ab.return_location END,
    custom_return_location = CASE WHEN b.different_return_location
                                  THEN NULLIF(b.return_location, '') ELSE ab.custom_return_location END
FROM bookings b
WHERE b.booking_reference = ab.booking_reference
  AND ab.source = 'web'          -- walk-in references are random and have collided with web ones twice
  AND ab.price_per_day IS NULL;

-- 2) Walk-in / phone bookings: back the rate out of the stored total
--    (total = rate × days + 3 €/h, nothing else existed before this migration).
UPDATE admin_bookings
SET price_per_day = CASE
      WHEN rental_days > 0
        THEN GREATEST(0, ROUND((total_price - COALESCE(extra_hours, 0) * 3)::numeric / rental_days))::int
      ELSE total_price
    END
WHERE price_per_day IS NULL;

-- 3) Web rows whose stored total no longer matches rate × days + extras: the admin re-dated or
--    re-priced them with the pre-008 code, which recomputed total = rate × days + 3 €/h and dropped
--    the supplements. Make the parts reproduce the stored total, so the next admin edit does not
--    silently change the amount. Keep the extras only if a plausible rate (≥ 50 % of the web rate)
--    remains once they are subtracted; otherwise drop them and derive the rate from the total.
--    (31 rows on 2026-10-01; 0 mismatches afterwards.)
WITH calc AS (
  SELECT ab.id, ab.total_price, ab.rental_days, COALESCE(ab.extra_hours, 0) AS h, ab.price_per_day,
         (SELECT COALESCE(SUM((e->>'price')::numeric * COALESCE((e->>'quantity')::int, 1)), 0)
            FROM jsonb_array_elements(ab.extras) e) AS extras_per_day
  FROM admin_bookings ab
  WHERE ab.source = 'web' AND ab.rental_days > 0 AND ab.price_per_day IS NOT NULL
), mismatched AS (
  SELECT *, (total_price - 3 * h - extras_per_day * rental_days) / rental_days AS rate_with_extras
  FROM calc
  WHERE total_price <> price_per_day * rental_days + 3 * h + extras_per_day * rental_days
)
UPDATE admin_bookings ab
SET price_per_day = CASE WHEN m.rate_with_extras >= 0.5 * m.price_per_day
                         THEN ROUND(m.rate_with_extras)::int
                         ELSE GREATEST(0, ROUND((m.total_price - 3 * m.h)::numeric / m.rental_days))::int END,
    extras = CASE WHEN m.rate_with_extras >= 0.5 * m.price_per_day THEN ab.extras ELSE '[]'::jsonb END
FROM mismatched m
WHERE ab.id = m.id;

-- 4) Walk-in / phone rows never had supplements: anything that landed there (reference collision
--    with a web booking before step 1 had the source filter) is dropped and the rate re-derived.
UPDATE admin_bookings
SET extras = '[]'::jsonb,
    price_per_day = CASE WHEN rental_days > 0
      THEN GREATEST(0, ROUND((total_price - COALESCE(extra_hours, 0) * 3)::numeric / rental_days))::int
      ELSE total_price END
WHERE source <> 'web'
  AND (jsonb_array_length(extras) > 0
       OR total_price <> price_per_day * rental_days + 3 * COALESCE(extra_hours, 0));
