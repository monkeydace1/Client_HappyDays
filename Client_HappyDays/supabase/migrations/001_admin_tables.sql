-- Admin Dashboard V2 - Database Schema
-- Run this in Supabase SQL Editor

-- ============================================
-- VEHICLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS vehicles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  brand VARCHAR(50) NOT NULL,
  model VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL,
  transmission VARCHAR(20) NOT NULL DEFAULT 'Manuelle',
  fuel VARCHAR(20) NOT NULL DEFAULT 'Diesel',
  seats INTEGER NOT NULL DEFAULT 5,
  price_per_day INTEGER NOT NULL,
  image TEXT,
  license_plate VARCHAR(20),
  status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'maintenance', 'retired')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BOOKINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admin_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_reference VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  source VARCHAR(20) NOT NULL DEFAULT 'web' CHECK (source IN ('web', 'walk_in', 'phone')),

  -- Dates
  departure_date DATE NOT NULL,
  return_date DATE NOT NULL,
  rental_days INTEGER NOT NULL,

  -- Location
  pickup_location TEXT NOT NULL,
  return_location TEXT,

  -- Vehicle
  vehicle_id INTEGER REFERENCES vehicles(id),
  vehicle_name VARCHAR(100) NOT NULL,
  assigned_vehicle_id INTEGER REFERENCES vehicles(id),

  -- Client
  client_name VARCHAR(100) NOT NULL,
  client_phone VARCHAR(30),
  client_email VARCHAR(100),

  -- Pricing
  total_price INTEGER NOT NULL,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_bookings_status ON admin_bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON admin_bookings(departure_date, return_date);
CREATE INDEX IF NOT EXISTS idx_bookings_vehicle ON admin_bookings(assigned_vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON admin_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_bookings ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (in production, add proper auth)
CREATE POLICY "Allow all for vehicles" ON vehicles FOR ALL USING (true);
CREATE POLICY "Allow all for admin_bookings" ON admin_bookings FOR ALL USING (true);

-- ============================================
-- SEED DATA - 18 VEHICLES
-- ============================================
INSERT INTO vehicles (id, name, brand, model, category, transmission, fuel, seats, price_per_day, image, license_plate, status) VALUES
-- Économique
(1, 'Clio 5 Noir', 'Renault', 'Clio 5', 'Économique', 'Manuelle', 'Essence', 5, 3500, '/images/cars/clio5.jpg', '00001-123-16', 'available'),
(2, 'Clio 5 Blanc', 'Renault', 'Clio 5', 'Économique', 'Manuelle', 'Essence', 5, 3500, '/images/cars/clio5.jpg', '00002-123-16', 'available'),
(3, 'Clio 5 Gris', 'Renault', 'Clio 5', 'Économique', 'Manuelle', 'Essence', 5, 3500, '/images/cars/clio5.jpg', '00003-123-16', 'available'),

-- Compacte
(4, 'Symbol Noir', 'Renault', 'Symbol', 'Compacte', 'Manuelle', 'Diesel', 5, 4000, '/images/cars/symbol.jpg', '00004-123-16', 'available'),
(5, 'Symbol Blanc', 'Renault', 'Symbol', 'Compacte', 'Manuelle', 'Diesel', 5, 4000, '/images/cars/symbol.jpg', '00005-123-16', 'available'),
(6, 'Symbol Gris', 'Renault', 'Symbol', 'Compacte', 'Manuelle', 'Diesel', 5, 4000, '/images/cars/symbol.jpg', '00006-123-16', 'available'),

-- Berline
(7, 'Peugeot 301 Noir', 'Peugeot', '301', 'Berline', 'Manuelle', 'Diesel', 5, 4500, '/images/cars/301.jpg', '00007-123-16', 'available'),
(8, 'Peugeot 301 Blanc', 'Peugeot', '301', 'Berline', 'Manuelle', 'Diesel', 5, 4500, '/images/cars/301.jpg', '00008-123-16', 'available'),
(9, 'Peugeot 301 Gris', 'Peugeot', '301', 'Berline', 'Manuelle', 'Diesel', 5, 4500, '/images/cars/301.jpg', '00009-123-16', 'available'),

-- Familiale
(10, 'Dacia Logan MCV Noir', 'Dacia', 'Logan MCV', 'Familiale', 'Manuelle', 'Diesel', 7, 5000, '/images/cars/logan-mcv.jpg', '00010-123-16', 'available'),
(11, 'Dacia Logan MCV Blanc', 'Dacia', 'Logan MCV', 'Familiale', 'Manuelle', 'Diesel', 7, 5000, '/images/cars/logan-mcv.jpg', '00011-123-16', 'available'),
(12, 'Dacia Logan MCV Gris', 'Dacia', 'Logan MCV', 'Familiale', 'Manuelle', 'Diesel', 7, 5000, '/images/cars/logan-mcv.jpg', '00012-123-16', 'available'),

-- SUV
(13, 'Dacia Duster Noir', 'Dacia', 'Duster', 'SUV', 'Manuelle', 'Diesel', 5, 6000, '/images/cars/duster.jpg', '00013-123-16', 'available'),
(14, 'Dacia Duster Blanc', 'Dacia', 'Duster', 'SUV', 'Manuelle', 'Diesel', 5, 6000, '/images/cars/duster.jpg', '00014-123-16', 'available'),
(15, 'Dacia Duster Gris', 'Dacia', 'Duster', 'SUV', 'Manuelle', 'Diesel', 5, 6000, '/images/cars/duster.jpg', '00015-123-16', 'available'),

-- Premium
(16, 'Peugeot 3008 Noir', 'Peugeot', '3008', 'Premium', 'Automatique', 'Diesel', 5, 8000, '/images/cars/3008.jpg', '00016-123-16', 'available'),
(17, 'Peugeot 3008 Blanc', 'Peugeot', '3008', 'Premium', 'Automatique', 'Diesel', 5, 8000, '/images/cars/3008.jpg', '00017-123-16', 'available'),
(18, 'Peugeot 3008 Gris', 'Peugeot', '3008', 'Premium', 'Automatique', 'Diesel', 5, 8000, '/images/cars/3008.jpg', '00018-123-16', 'available')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence to continue after 18
SELECT setval('vehicles_id_seq', 18, true);
