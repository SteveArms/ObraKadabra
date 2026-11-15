import type { SupabaseClient } from "@supabase/supabase-js";
import type { PlanImageRecord } from "@/lib/projects/plan-images";
import { PHOTOS_BUCKET, PHOTOS_TABLE } from "./config";
import { currentUser, ensureUserId } from "./session";

function check(error: unknown): void {
  if (error) throw error;
}

// Files sit under the owner's id, which is the folder the storage policies let each user touch
const planPath = (userId: string, projectId: string, level: number) => `${userId}/plans/${projectId}/${level}`;
const progressPath = (userId: string, entryId: string) => `${userId}/progress/${entryId}`;

async function upload(client: SupabaseClient, path: string, blob: Blob, row: Record<string, unknown>): Promise<void> {
  check((await client.storage.from(PHOTOS_BUCKET).upload(path, blob, { upsert: true, contentType: blob.type || "image/jpeg" })).error);
  check((await client.from(PHOTOS_TABLE).upsert({ path, ...row })).error);
}

async function download(client: SupabaseClient, path: string): Promise<Blob | undefined> {
  const { data } = await client.storage.from(PHOTOS_BUCKET).download(path);
  return data ?? undefined;
}

export async function uploadPlanImages(client: SupabaseClient, records: PlanImageRecord[]): Promise<void> {
  const userId = await ensureUserId(client);
  for (const { projectId, level, blob, width, height } of records) {
    await upload(client, planPath(userId, projectId, level), blob, { project_id: projectId, kind: "plan", level, width, height });
  }
}

export async function downloadPlanImage(client: SupabaseClient, projectId: string, level: number): Promise<PlanImageRecord | undefined> {
  const user = await currentUser(client);
  if (!user) return undefined;
  const { data } = await client.from(PHOTOS_TABLE).select("path, width, height").eq("project_id", projectId).eq("kind", "plan").eq("level", level).maybeSingle();
  if (!data || typeof data.width !== "number" || typeof data.height !== "number") return undefined;
  const blob = await download(client, String(data.path));
  return blob ? { projectId, level, blob, width: data.width, height: data.height } : undefined;
}

export async function uploadProgressPhoto(client: SupabaseClient, entryId: string, blob: Blob): Promise<void> {
  const userId = await ensureUserId(client);
  await upload(client, progressPath(userId, entryId), blob, { kind: "progress", entry_id: entryId });
}

export async function downloadProgressPhoto(client: SupabaseClient, entryId: string): Promise<Blob | undefined> {
  const user = await currentUser(client);
  return user ? download(client, progressPath(user.id, entryId)) : undefined;
}
