import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { SharedProject } from "@/schemas/shared";
import { PHOTOS_BUCKET, SHARED_PROJECT_RPC } from "./config";
import { rowsTo, rowToProgress, rowToProject } from "./rows";

const SharedRowSchema = z.object({ project: z.unknown(), progress: z.array(z.unknown()), photo_path: z.string().nullish() });

// A signed URL lasts long enough to read the page; a reload asks for a new one
const PHOTO_URL_SECONDS = 60 * 60;

export type SharedLookup = { shared: SharedProject; photoPath?: string };

// Works without a session: the database function checks the token and returns only what the family may see
export async function fetchSharedLookup(client: SupabaseClient, token: string): Promise<SharedLookup | undefined> {
  const { data, error } = await client.rpc(SHARED_PROJECT_RPC, { token });
  if (error) throw error;
  const parsed = SharedRowSchema.safeParse(data);
  if (!parsed.success) return undefined;
  const project = rowToProject(parsed.data.project);
  if (!project) return undefined;
  return { shared: { project, progress: rowsTo(parsed.data.progress, rowToProgress) }, photoPath: parsed.data.photo_path ?? undefined };
}

export async function fetchSharedProject(client: SupabaseClient, token: string): Promise<SharedProject | undefined> {
  return (await fetchSharedLookup(client, token))?.shared;
}

export async function signPhotoUrl(admin: SupabaseClient, path: string): Promise<string | undefined> {
  const { data } = await admin.storage.from(PHOTOS_BUCKET).createSignedUrl(path, PHOTO_URL_SECONDS);
  return data?.signedUrl;
}
