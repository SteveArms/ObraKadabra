// Photos are too large for localStorage, so they live in IndexedDB; version 2 added the site photos next to the plans
const DB_NAME = "obrakadabra";
const DB_VERSION = 2;
export const PLAN_IMAGES_STORE = "plan-images";
export const PROGRESS_PHOTOS_STORE = "progress-photos";

export function openPhotoDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(PLAN_IMAGES_STORE)) db.createObjectStore(PLAN_IMAGES_STORE, { keyPath: ["projectId", "level"] });
      if (!db.objectStoreNames.contains(PROGRESS_PHOTOS_STORE)) db.createObjectStore(PROGRESS_PHOTOS_STORE, { keyPath: "entryId" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function putRecords(store: string, records: unknown[]): Promise<void> {
  const db = await openPhotoDb();
  const transaction = db.transaction(store, "readwrite");
  for (const record of records) transaction.objectStore(store).put(record);
  await new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  db.close();
}

export async function getRecord<T>(store: string, key: IDBValidKey): Promise<T | undefined> {
  const db = await openPhotoDb();
  const request = db.transaction(store).objectStore(store).get(key);
  const record = await new Promise<T | undefined>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return record;
}
