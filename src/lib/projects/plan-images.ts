import { getBrowserSupabase } from "@/lib/supabase/browser";
import { downloadPlanImage, uploadPlanImages } from "@/lib/supabase/photo-store";
import { getRecord, PLAN_IMAGES_STORE, putRecords } from "./indexed-db";

export type PlanImageRecord = { projectId: string; level: number; blob: Blob; width: number; height: number };

// Supabase Storage when it is configured, IndexedDB on this device otherwise
export function savePlanImages(records: PlanImageRecord[]): Promise<void> {
  const client = getBrowserSupabase();
  return client ? uploadPlanImages(client, records) : putRecords(PLAN_IMAGES_STORE, records);
}

export function getPlanImage(projectId: string, level: number): Promise<PlanImageRecord | undefined> {
  const client = getBrowserSupabase();
  return client ? downloadPlanImage(client, projectId, level) : getRecord<PlanImageRecord>(PLAN_IMAGES_STORE, [projectId, level]);
}
