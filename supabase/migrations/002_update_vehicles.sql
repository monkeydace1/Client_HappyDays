-- Update vehicles table to match current website data
-- Run this in Supabase SQL Editor

-- ============================================
-- ADD MISSING COLUMNS
-- ============================================
-- Add year column if it doesn't exist
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS year INTEGER NOT NULL DEFAULT 2020;

-- Add featured column if it doesn't exist
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT false;

-- ============================================
-- CLEAR OLD DATA
-- ============================================
TRUNCATE TABLE vehicles RESTART IDENTITY CASCADE;

-- ============================================
-- INSERT CURRENT VEHICLE DATA (19 vehicles)
-- ============================================
INSERT INTO vehicles (id, name, brand, model, year, category, transmission, fuel, seats, price_per_day, image, status, featured) VALUES
-- Premium / SUV
(1, 'Fiat 500X', 'Fiat', '500X', 2024, 'SUV', 'Automatique', 'Essence', 5, 45, '/vehicles/fiat-500x/main.jpg', 'available', true),

-- Citadines récentes
(2, 'Renault Clio 5', 'Renault', 'Clio 5', 2022, 'Citadine', 'Manuelle', 'Essence', 5, 35, '/vehicles/renault-clio5/main.jpg', 'available', true),
(3, 'Peugeot 208', 'Peugeot', '208', 2022, 'Citadine', 'Manuelle', 'Essence', 5, 35, '/vehicles/peugeot-208/main.jpg', 'available', true),
(4, 'Seat Ibiza', 'Seat', 'Ibiza', 2019, 'Citadine', 'Automatique', 'Essence', 5, 35, '/vehicles/seat-ibiza-2019-auto/main.jpg', 'available', true),
(5, 'Seat Ibiza FR', 'Seat', 'Ibiza FR', 2019, 'Citadine', 'Manuelle', 'Essence', 5, 35, '/vehicles/seat-ibiza-fr/main.jpg', 'available', false),
(6, 'Suzuki Swift', 'Suzuki', 'Swift', 2022, 'Citadine', 'Automatique', 'Essence', 5, 30, '/vehicles/suzuki-swift/main.jpg', 'available', false),

-- Compactes
(7, 'Volkswagen Polo Star Plus', 'Volkswagen', 'Polo Star Plus', 2019, 'Citadine', 'Manuelle', 'Essence', 5, 32, '/vehicles/vw-polo-2019/main.jpg', 'available', false),
(8, 'Renault Clio 4 Limited', 'Renault', 'Clio 4 Limited 2', 2019, 'Citadine', 'Manuelle', 'Diesel', 5, 32, '/vehicles/renault-clio4-limited/main.jpg', 'available', false),
(9, 'Seat Ibiza Style', 'Seat', 'Ibiza Style', 2018, 'Citadine', 'Manuelle', 'Essence', 5, 30, '/vehicles/seat-ibiza-style/main.jpg', 'available', false),
(10, 'Fiat 500 Dolce Vita', 'Fiat', '500 Dolce Vita', 2025, 'Citadine', 'Manuelle', 'Hybride', 4, 30, '/vehicles/fiat-500-dolcevita/main.jpg', 'available', false),
(11, 'Toyota Yaris', 'Toyota', 'Yaris', 2017, 'Citadine', 'Automatique', 'Essence', 5, 28, '/vehicles/toyota-yaris/main.jpg', 'available', false),

-- Économiques
(12, 'Renault Symbol', 'Renault', 'Symbol', 2018, 'Berline', 'Manuelle', 'Essence', 5, 26, '/vehicles/renault-symbol/main.jpg', 'available', false),
(13, 'Seat Ibiza Sol', 'Seat', 'Ibiza Sol', 2017, 'Citadine', 'Manuelle', 'Essence', 5, 27, '/vehicles/seat-ibiza-sol/main.jpg', 'available', false),
(14, 'Kia Picanto', 'Kia', 'Picanto', 2019, 'Mini', 'Manuelle', 'Essence', 4, 25, '/vehicles/kia-picanto/main.jpg', 'available', false),
(15, 'Volkswagen Polo Carat', 'Volkswagen', 'Polo Carat', 2016, 'Citadine', 'Manuelle', 'Essence', 5, 28, '/vehicles/vw-polo-carat/main.jpg', 'available', false),
(16, 'Renault Clio 4', 'Renault', 'Clio 4', 2016, 'Citadine', 'Manuelle', 'Essence', 5, 25, '/vehicles/renault-clio4-2016/main.jpg', 'available', false),
(17, 'Renault Clio 4', 'Renault', 'Clio 4', 2013, 'Citadine', 'Manuelle', 'Essence', 5, 22, '/vehicles/renault-clio4-2013/main.jpg', 'available', false),

-- Budget
(18, 'Nissan Micra', 'Nissan', 'Micra', 2015, 'Mini', 'Manuelle', 'Essence', 5, 20, '/vehicles/nissan-micra/main.jpg', 'available', false),
(19, 'Ford Fiesta', 'Ford', 'Fiesta', 2014, 'Citadine', 'Manuelle', 'Essence', 5, 20, '/vehicles/ford-fiesta/main.jpg', 'available', false);

-- Reset sequence to continue after 19
SELECT setval('vehicles_id_seq', 19, true);
