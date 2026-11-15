import { getBrowserSupabase } from "@/lib/supabase/browser";
import { createSupabaseProjectRepository } from "@/lib/supabase/project-repository";
import { createLocalProjectRepository } from "./local-repository";
import type { ProjectRepository } from "./repository";

// The only place that picks the storage: Supabase when its env vars are set, this browser's localStorage otherwise
export function getProjectRepository(): ProjectRepository {
  const client = getBrowserSupabase();
  return client ? createSupabaseProjectRepository(client) : createLocalProjectRepository(window.localStorage);
}

export function isCloudStorage(): boolean {
  return Boolean(getBrowserSupabase());
}
