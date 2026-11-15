// Plan photos are too large for localStorage, so they live in IndexedDB keyed by project and floor
const DB_NAME = "obrakadabra";
const STORE = "plan-images";

export type PlanImageRecord = { projectId: string; level: number; blob: Blob; width: number; height: number };

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: ["projectId", "level"] });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function done(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function savePlanImages(records: PlanImageRecord[]): Promise<void> {
  const db = await open();
  const transaction = db.transaction(STORE, "readwrite");
  for (const record of records) transaction.objectStore(STORE).put(record);
  await done(transaction);
  db.close();
}

export async function getPlanImage(projectId: string, level: number): Promise<PlanImageRecord | undefined> {
  const db = await open();
  const request = db.transaction(STORE).objectStore(STORE).get([projectId, level]);
  const record = await new Promise<PlanImageRecord | undefined>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result as PlanImageRecord | undefined);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return record;
}
