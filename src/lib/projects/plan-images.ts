import { loadCloudPhotos } from "./cloud";
import { getRecord, PLAN_IMAGES_STORE, putRecords } from "./indexed-db";

export type PlanImageRecord = { projectId: string; level: number; blob: Blob; width: number; height: number };

// Supabase Storage when it is configured, IndexedDB on this device otherwise
export async function savePlanImages(records: PlanImageRecord[]): Promise<void> {
  const cloud = await loadCloudPhotos();
  return cloud ? cloud.store.uploadPlanImages(cloud.client, records) : putRecords(PLAN_IMAGES_STORE, records);
}

export async function getPlanImage(projectId: string, level: number): Promise<PlanImageRecord | undefined> {
  const cloud = await loadCloudPhotos();
  return cloud ? cloud.store.downloadPlanImage(cloud.client, projectId, level) : getRecord<PlanImageRecord>(PLAN_IMAGES_STORE, [projectId, level]);
}
