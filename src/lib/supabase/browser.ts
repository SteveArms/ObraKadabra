import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseConfig } from "./config";

let client: SupabaseClient | undefined;

// One client per tab, so the anonymous session is created once and reused by every repository call
export function getBrowserSupabase(): SupabaseClient | undefined {
  const config = supabaseConfig();
  if (!config || typeof window === "undefined") return undefined;
  client ??= createClient(config.url, config.key);
  return client;
}
