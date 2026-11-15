import { getRecord, PROGRESS_PHOTOS_STORE, putRecords } from "./indexed-db";

// TODO: move to Supabase Storage in phase 7 behind these same two functions
export type ProgressPhotoRecord = { entryId: string; blob: Blob };

export function saveProgressPhoto(entryId: string, blob: Blob): Promise<void> {
  return putRecords(PROGRESS_PHOTOS_STORE, [{ entryId, blob }]);
}

export async function getProgressPhoto(entryId: string): Promise<Blob | undefined> {
  return (await getRecord<ProgressPhotoRecord>(PROGRESS_PHOTOS_STORE, entryId))?.blob;
}
