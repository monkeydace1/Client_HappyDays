import { createClient } from '@supabase/supabase-js';

// .trim() matters: the Vercel env vars were stored with a trailing newline.
// Browsers strip it from HTTP headers (REST worked) but not from the realtime
// websocket query string, which made every realtime handshake fail with 401.
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'public',
  },
  auth: {
    persistSession: false,
  },
});
