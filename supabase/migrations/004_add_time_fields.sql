-- Migration: Add pickup and return time fields
-- Times are stored as TIME type (HH:MM format internally)
-- Displayed as 12-hour AM/PM format in the UI

-- Add time columns to admin_bookings
ALTER TABLE admin_bookings
ADD COLUMN IF NOT EXISTS pickup_time TIME,
ADD COLUMN IF NOT EXISTS return_time TIME;

-- Add time columns to bookings table (for web bookings)
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS pickup_time TIME,
ADD COLUMN IF NOT EXISTS return_time TIME;

-- Add client_email to admin_bookings if not exists
ALTER TABLE admin_bookings
ADD COLUMN IF NOT EXISTS client_email VARCHAR(255);

-- Add comments for documentation
COMMENT ON COLUMN admin_bookings.pickup_time IS 'Pickup time - stored as HH:MM, display as 12h AM/PM';
COMMENT ON COLUMN admin_bookings.return_time IS 'Return time - stored as HH:MM, display as 12h AM/PM';

-- Add index for date+time queries (useful for finding overdue rentals)
CREATE INDEX IF NOT EXISTS idx_admin_bookings_return_datetime
ON admin_bookings (return_date, return_time);
