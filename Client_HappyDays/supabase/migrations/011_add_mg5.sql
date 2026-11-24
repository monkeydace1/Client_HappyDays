-- Migration 011: new vehicle #24 MG5 2026 (CHANGES.md #16, November 2026)
--
-- Manual petrol sedan, 35 €/day. The public site reads src/data/vehicleData.ts, the admin
-- grid / QuickAdd / maintenance filter / finance read this table; keep the two identical.
--
-- Run on DEPLOY DAY, right after the new frontend is live: the current live bundle does not
-- know ID 24, so inserting earlier would show the car in the live admin without its photo.

INSERT INTO vehicles (id, name, brand, model, year, category, transmission, fuel, seats, price_per_day, image, status, featured, notes)
VALUES (24, 'MG5', 'MG', 'MG5', 2026, 'Berline', 'Manuelle', 'Essence', 5,
        35,
        '/vehicles/mg5-2026/main.jpg', 'available', false, 'Ajouté en novembre 2026')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, brand = EXCLUDED.brand, model = EXCLUDED.model, year = EXCLUDED.year,
  category = EXCLUDED.category, transmission = EXCLUDED.transmission, fuel = EXCLUDED.fuel,
  seats = EXCLUDED.seats, price_per_day = EXCLUDED.price_per_day, image = EXCLUDED.image;

SELECT setval('vehicles_id_seq', GREATEST(24, (SELECT MAX(id) FROM vehicles)), true);
