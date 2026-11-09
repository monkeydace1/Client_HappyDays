-- Migration 010: new vehicle #23 Geely Coolray Manuelle (CHANGES.md #14, November 2026)
--
-- A second Coolray, separate from #22 (automatic, 55 €). The public site reads
-- src/data/vehicleData.ts, the admin grid / QuickAdd / maintenance filter read this table;
-- keep the two identical.
--
-- Run on DEPLOY DAY, right after the new frontend is live: the current live bundle does not
-- know ID 23, so inserting earlier would show the car in the live admin without its photo.

INSERT INTO vehicles (id, name, brand, model, year, category, transmission, fuel, seats, price_per_day, image, status, featured, notes)
VALUES (23, 'Geely Coolray Manuelle', 'Geely', 'Coolray', 2026, 'SUV', 'Manuelle', 'Essence', 5,
        36,
        '/vehicles/geely-coolray-manuelle/main.jpg', 'available', false, 'Ajouté en novembre 2026')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, brand = EXCLUDED.brand, model = EXCLUDED.model, year = EXCLUDED.year,
  category = EXCLUDED.category, transmission = EXCLUDED.transmission, fuel = EXCLUDED.fuel,
  seats = EXCLUDED.seats, price_per_day = EXCLUDED.price_per_day, image = EXCLUDED.image;

SELECT setval('vehicles_id_seq', GREATEST(23, (SELECT MAX(id) FROM vehicles)), true);
