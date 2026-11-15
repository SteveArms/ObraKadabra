import { getRecord, PLAN_IMAGES_STORE, putRecords } from "./indexed-db";

export type PlanImageRecord = { projectId: string; level: number; blob: Blob; width: number; height: number };

export function savePlanImages(records: PlanImageRecord[]): Promise<void> {
  return putRecords(PLAN_IMAGES_STORE, records);
}

export function getPlanImage(projectId: string, level: number): Promise<PlanImageRecord | undefined> {
  return getRecord<PlanImageRecord>(PLAN_IMAGES_STORE, [projectId, level]);
}
