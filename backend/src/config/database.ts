import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';

let supabase: SupabaseClient;
let supabaseAdmin: SupabaseClient;

export const getSupabase = (): SupabaseClient => {
  if (!supabase) {
    supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
  }
  return supabase;
};

export const getSupabaseAdmin = (): SupabaseClient => {
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return supabaseAdmin;
};
