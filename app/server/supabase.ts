import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { assertPublicSupabaseKey } from '../shared/publicSupabaseConfig.mjs';

// Public SSR reads deliberately use the public key, never service_role.
export function createPublicSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  assertPublicSupabaseKey(key);
  if (!url || !key) throw new Error('Missing public Supabase configuration.');
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
