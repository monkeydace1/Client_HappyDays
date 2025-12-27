-- Migration: Set up webhook trigger for Google Sheets sync
-- This trigger calls the sync-to-sheets Edge Function when new bookings are created
-- Syncs the full "bookings" table (with all client details)

-- Enable pg_net extension for HTTP calls (required for webhooks)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create webhook trigger function
CREATE OR REPLACE FUNCTION notify_sheets_sync()
RETURNS TRIGGER AS $$
DECLARE
  payload JSON;
BEGIN
  -- Build the webhook payload matching the Edge Function expected format
  payload := json_build_object(
    'type', TG_OP,
    'table', TG_TABLE_NAME,
    'schema', TG_TABLE_SCHEMA,
    'record', row_to_json(NEW),
    'old_record', NULL
  );

  -- Call the Edge Function via HTTP POST
  PERFORM net.http_post(
    url := 'https://rhozdkdwjolxcquupamt.supabase.co/functions/v1/sync-to-sheets',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := payload::jsonb
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on bookings table (fires on INSERT only)
-- This is the full client details table, not admin_bookings
DROP TRIGGER IF EXISTS bookings_sheets_sync ON bookings;

CREATE TRIGGER bookings_sheets_sync
  AFTER INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION notify_sheets_sync();

-- Add comment for documentation
COMMENT ON FUNCTION notify_sheets_sync() IS 'Webhook trigger that syncs new bookings to Google Sheets via Edge Function';
