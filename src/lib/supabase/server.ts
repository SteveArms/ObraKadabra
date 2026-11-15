import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseConfig } from "./config";

const NO_SESSION = { auth: { persistSession: false, autoRefreshToken: false } };

// Visitor of a shared link: no session, so it can only call the public share function
export function createPublicSupabase(): SupabaseClient | undefined {
  const config = supabaseConfig();
  return config ? createClient(config.url, config.key, NO_SESSION) : undefined;
}

// Server only: signs short-lived photo URLs for the shared view; the secret key never reaches the browser
export function createAdminSupabase(): SupabaseClient | undefined {
  const config = supabaseConfig();
  const secret = process.env.SUPABASE_SECRET_KEY;
  return config && secret ? createClient(config.url, secret, NO_SESSION) : undefined;
}
