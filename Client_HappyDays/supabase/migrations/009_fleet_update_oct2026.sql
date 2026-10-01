-- Migration 009: fleet update October 2026 (CHANGES.md #6)
--
-- The admin grid / QuickAdd / maintenance filter read this table, the public site reads
-- src/data/vehicleData.ts, so the two are updated in two steps:
--
--   PART A — run as soon as the code is ready (done 2026-10-01): names, specs, prices, #22.
--            Statuses untouched: #11 / #19 stay 'maintenance', which keeps the old Toyota
--            Yaris / Ford Fiesta hidden on the LIVE site (its bundle still knows them under
--            those names). Image paths untouched for the same reason (the live admin reads
--            them; the new frontend prefers the bundled photo per ID anyway).
--   PART B — run on DEPLOY DAY together with the new frontend: make #11 / #19 available and
--            point the image column at the new folders.
--
-- TODO before PART B: confirm the three prices marked "to confirm" (38 / 38 / 50 €) and
-- keep them identical to src/data/vehicleData.ts.

-- ============================================
-- PART A (applied 2026-10-01)
-- ============================================

-- #11 Toyota Yaris → Livan X3 Pro Gris (same ID, admin numbering unchanged)
UPDATE vehicles SET
  name = 'Livan X3 Pro Gris', brand = 'Livan', model = 'X3 Pro', year = 2025,
  category = 'SUV', transmission = 'Automatique', fuel = 'Essence', seats = 5,
  price_per_day = 38,                                   -- to confirm
  featured = false,
  notes = 'Remplace la Toyota Yaris (octobre 2026)'
WHERE id = 11;

-- #19 Ford Fiesta → Livan X3 Pro Noir
UPDATE vehicles SET
  name = 'Livan X3 Pro Noir', brand = 'Livan', model = 'X3 Pro', year = 2025,
  category = 'SUV', transmission = 'Automatique', fuel = 'Essence', seats = 5,
  price_per_day = 38,                                   -- to confirm
  featured = false,
  notes = 'Remplace la Ford Fiesta (octobre 2026)'
WHERE id = 19;

-- #21 Seat Leon: 50 € → 45 €
UPDATE vehicles SET price_per_day = 45 WHERE id = 21;

-- #22 Geely Coolray (new)
INSERT INTO vehicles (id, name, brand, model, year, category, transmission, fuel, seats, price_per_day, image, status, featured, notes)
VALUES (22, 'Geely Coolray', 'Geely', 'Coolray', 2026, 'SUV', 'Automatique', 'Essence', 5,
        50,                                             -- to confirm
        '/vehicles/geely-coolray/main.jpg', 'available', false, 'Ajouté en octobre 2026')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, brand = EXCLUDED.brand, model = EXCLUDED.model, year = EXCLUDED.year,
  category = EXCLUDED.category, transmission = EXCLUDED.transmission, fuel = EXCLUDED.fuel,
  seats = EXCLUDED.seats, price_per_day = EXCLUDED.price_per_day, image = EXCLUDED.image;

SELECT setval('vehicles_id_seq', GREATEST(22, (SELECT MAX(id) FROM vehicles)), true);

-- ============================================
-- PART B (deploy day — right after the new frontend is live)
-- ============================================

UPDATE vehicles SET status = 'available', image = '/vehicles/livan-x3-pro-gris/main.jpg' WHERE id = 11;
UPDATE vehicles SET status = 'available', image = '/vehicles/livan-x3-pro-noir/main.jpg' WHERE id = 19;
UPDATE vehicles SET image = '/vehicles/seat-arona/main.jpg'     WHERE id = 16;
UPDATE vehicles SET image = '/vehicles/seat-leon-2021/main.jpg' WHERE id = 21;
