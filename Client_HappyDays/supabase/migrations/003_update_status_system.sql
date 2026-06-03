-- Migration: Update booking status system
-- New flow: new -> pending -> active -> completed/cancelled
-- Colors: new=purple, pending=orange, active=green, completed=blue, cancelled=red

-- Drop existing constraint if it exists
ALTER TABLE admin_bookings DROP CONSTRAINT IF EXISTS admin_bookings_status_check;

-- Add new constraint with updated status values
ALTER TABLE admin_bookings
ADD CONSTRAINT admin_bookings_status_check
CHECK (status IN ('new', 'pending', 'active', 'completed', 'cancelled'));

-- Migrate existing 'confirmed' status to 'active'
UPDATE admin_bookings SET status = 'active' WHERE status = 'confirmed';

-- Also update the bookings table if it has status constraint
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE bookings
ADD CONSTRAINT bookings_status_check
CHECK (status IN ('new', 'pending', 'active', 'completed', 'cancelled'));

UPDATE bookings SET status = 'active' WHERE status = 'confirmed';
