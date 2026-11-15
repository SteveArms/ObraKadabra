import { getBrowserSupabase } from "@/lib/supabase/browser";
import { downloadProgressPhoto, uploadProgressPhoto } from "@/lib/supabase/photo-store";
import { getRecord, PROGRESS_PHOTOS_STORE, putRecords } from "./indexed-db";

type ProgressPhotoRecord = { entryId: string; blob: Blob };

// Supabase Storage when it is configured, IndexedDB on this device otherwise
export function saveProgressPhoto(entryId: string, blob: Blob): Promise<void> {
  const client = getBrowserSupabase();
  return client ? uploadProgressPhoto(client, entryId, blob) : putRecords(PROGRESS_PHOTOS_STORE, [{ entryId, blob }]);
}

export async function getProgressPhoto(entryId: string): Promise<Blob | undefined> {
  const client = getBrowserSupabase();
  if (client) return downloadProgressPhoto(client, entryId);
  return (await getRecord<ProgressPhotoRecord>(PROGRESS_PHOTOS_STORE, entryId))?.blob;
}
