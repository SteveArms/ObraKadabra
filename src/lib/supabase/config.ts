export type SupabaseConfig = { url: string; key: string };

// NEXT_PUBLIC_ values are inlined at build time, so they are read by their literal names; empty values mean "use this device only"
export function supabaseConfig(): SupabaseConfig | undefined {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return url && key ? { url, key } : undefined;
}

export const PROJECTS_TABLE = "projects";
export const PROGRESS_TABLE = "progress_entries";
export const PHOTOS_TABLE = "photos";
export const PHOTOS_BUCKET = "photos";
export const SHARED_PROJECT_RPC = "get_shared_project";
