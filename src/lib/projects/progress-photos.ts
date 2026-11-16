import { loadCloudPhotos } from "./cloud";
import { getRecord, PROGRESS_PHOTOS_STORE, putRecords } from "./indexed-db";

type ProgressPhotoRecord = { entryId: string; blob: Blob };

// Supabase Storage when it is configured, IndexedDB on this device otherwise
export async function saveProgressPhoto(entryId: string, blob: Blob): Promise<void> {
  const cloud = await loadCloudPhotos();
  return cloud ? cloud.store.uploadProgressPhoto(cloud.client, entryId, blob) : putRecords(PROGRESS_PHOTOS_STORE, [{ entryId, blob }]);
}

export async function getProgressPhoto(entryId: string): Promise<Blob | undefined> {
  const cloud = await loadCloudPhotos();
  if (cloud) return cloud.store.downloadProgressPhoto(cloud.client, entryId);
  return (await getRecord<ProgressPhotoRecord>(PROGRESS_PHOTOS_STORE, entryId))?.blob;
}
