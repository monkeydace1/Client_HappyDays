-- Migration 009: fleet update October 2026 (CHANGES.md #6)
--
-- RUN ON DEPLOY DAY, together with the frontend that ships the new vehicleData.ts.
-- Setting #11 / #19 back to 'available' earlier would un-hide the old Toyota Yaris /
-- Ford Fiesta on the live site (the public site hides vehicles whose DB status is
-- maintenance / retired, and the live code still knows them under those names).
--
-- TODO before running: confirm the three prices marked "to confirm" (38 / 38 / 50 €)
-- and keep them identical to src/data/vehicleData.ts.

-- #11 Toyota Yaris → Livan X3 Pro Gris (same ID, admin numbering unchanged)
UPDATE vehicles SET
  name = 'Livan X3 Pro Gris', brand = 'Livan', model = 'X3 Pro', year = 2025,
  category = 'SUV', transmission = 'Automatique', fuel = 'Essence', seats = 5,
  price_per_day = 38,                                   -- to confirm
  image = '/vehicles/livan-x3-pro-gris/main.jpg',
  status = 'available', featured = false,
  notes = 'Remplace la Toyota Yaris (octobre 2026)'
WHERE id = 11;

-- #19 Ford Fiesta → Livan X3 Pro Noir
UPDATE vehicles SET
  name = 'Livan X3 Pro Noir', brand = 'Livan', model = 'X3 Pro', year = 2025,
  category = 'SUV', transmission = 'Automatique', fuel = 'Essence', seats = 5,
  price_per_day = 38,                                   -- to confirm
  image = '/vehicles/livan-x3-pro-noir/main.jpg',
  status = 'available', featured = false,
  notes = 'Remplace la Ford Fiesta (octobre 2026)'
WHERE id = 19;

-- #16 Seat Arona: new photos (new folder)
UPDATE vehicles SET image = '/vehicles/seat-arona/main.jpg' WHERE id = 16;

-- #21 Seat Leon: 50 € → 45 €, new photos (new folder)
UPDATE vehicles SET price_per_day = 45, image = '/vehicles/seat-leon-2021/main.jpg' WHERE id = 21;

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
