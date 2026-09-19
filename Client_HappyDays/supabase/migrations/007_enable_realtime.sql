-- Migration: Enable realtime change events for the admin dashboard
--
-- The admin dashboard subscribes to `postgres_changes` on admin_bookings and
-- vehicles (see src/admin/services/adminService.ts), but the supabase_realtime
-- publication contained no tables, so no change event was ever delivered and
-- the admin had to reload the page to see new bookings.
--
-- Revert with:
--   ALTER PUBLICATION supabase_realtime DROP TABLE public.admin_bookings, public.vehicles;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'admin_bookings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_bookings;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'vehicles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.vehicles;
  END IF;
END $$;
