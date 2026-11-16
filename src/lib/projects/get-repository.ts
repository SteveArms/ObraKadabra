import { supabaseConfig } from "@/lib/supabase/config";
import { loadCloudRepository } from "./cloud";
import { lazyRepository } from "./lazy-repository";
import { createLocalProjectRepository } from "./local-repository";
import type { ProjectRepository } from "./repository";

let cloud: ProjectRepository | undefined;

// The only place that picks the storage: Supabase when its env vars are set, this browser's localStorage otherwise
export function getProjectRepository(): ProjectRepository {
  if (!supabaseConfig()) return createLocalProjectRepository(window.localStorage);
  cloud ??= lazyRepository(loadCloudRepository);
  return cloud;
}

export function isCloudStorage(): boolean {
  return Boolean(supabaseConfig());
}
