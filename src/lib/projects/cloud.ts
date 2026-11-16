import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseConfig } from "@/lib/supabase/config";

export type CloudPhotos = { client: SupabaseClient; store: typeof import("@/lib/supabase/photo-store") };

// The Supabase SDK is imported on demand, so a visit that never stores photos or projects never downloads it
export async function loadCloudPhotos(): Promise<CloudPhotos | undefined> {
  if (!supabaseConfig()) return undefined;
  const [{ getBrowserSupabase }, store] = await Promise.all([import("@/lib/supabase/browser"), import("@/lib/supabase/photo-store")]);
  const client = getBrowserSupabase();
  return client ? { client, store } : undefined;
}

export async function loadCloudRepository() {
  const [{ getBrowserSupabase }, { createSupabaseProjectRepository }] = await Promise.all([import("@/lib/supabase/browser"), import("@/lib/supabase/project-repository")]);
  const client = getBrowserSupabase();
  if (!client) throw new Error("Supabase is only available in the browser");
  return createSupabaseProjectRepository(client);
}
