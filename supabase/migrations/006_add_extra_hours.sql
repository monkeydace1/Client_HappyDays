-- Migration: Add extra_hours column for the new pricing rule
-- Rule: a rental = N full days + 0..10 extra hours at 3€/h
--       (extra hours > 10 are promoted to a full day before storage)

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS extra_hours SMALLINT NOT NULL DEFAULT 0;

ALTER TABLE admin_bookings
ADD COLUMN IF NOT EXISTS extra_hours SMALLINT NOT NULL DEFAULT 0;

COMMENT ON COLUMN bookings.extra_hours IS
  'Extra hours beyond rental_days (0..10). Charged at 3€/h. >10 is rolled into rental_days.';
COMMENT ON COLUMN admin_bookings.extra_hours IS
  'Extra hours beyond rental_days (0..10). Charged at 3€/h. >10 is rolled into rental_days.';
