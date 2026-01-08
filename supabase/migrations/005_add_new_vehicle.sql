-- Migration: Add new vehicle Clio 4 Rouge (ID #20)

-- Insert new vehicle
INSERT INTO vehicles (id, name, brand, model, year, category, transmission, fuel, seats, price_per_day, image, status, notes)
VALUES (
    20,
    'Renault Clio 4 Rouge',
    'Renault',
    'Clio 4',
    2016,
    'Citadine',
    'Manuelle',
    'Essence',
    5,
    25,
    '/vehicles/renault-clio4-2016/main.jpg',
    'available',
    'Rouge - Véhicule ajouté janvier 2026'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    brand = EXCLUDED.brand,
    model = EXCLUDED.model,
    year = EXCLUDED.year,
    price_per_day = EXCLUDED.price_per_day;

-- Update sequence to ensure next ID is correct
SELECT setval('vehicles_id_seq', GREATEST(20, (SELECT MAX(id) FROM vehicles)), true);
