import { z } from "zod";
import { ProgressEntrySchema, type ProgressEntry } from "@/schemas/progress";
import { ProjectSchema, type Project } from "@/schemas/project";
import { getDemoProject, isDemoId } from "./demos";
import { ReadOnlyProjectError, type ProjectRepository } from "./repository";

export const PROJECTS_STORAGE_KEY = "obrakadabra:projects";
export const PROGRESS_STORAGE_KEY = "obrakadabra:progress";

type KeyValueStorage = Pick<Storage, "getItem" | "setItem">;

// Invalid items are skipped one by one, so a single corrupt record never hides the rest
function readList<T>(storage: KeyValueStorage, key: string, schema: z.ZodType<T>): T[] {
  const raw = storage.getItem(key);
  if (!raw) return [];
  try {
    const list = z.array(z.unknown()).safeParse(JSON.parse(raw));
    if (!list.success) return [];
    return list.data.flatMap((item) => {
      const parsed = schema.safeParse(item);
      return parsed.success ? [parsed.data] : [];
    });
  } catch {
    return [];
  }
}

function upsert<T extends { id: string }>(storage: KeyValueStorage, key: string, schema: z.ZodType<T>, item: T): T {
  const valid = schema.parse(item);
  const others = readList(storage, key, schema).filter((existing) => existing.id !== valid.id);
  storage.setItem(key, JSON.stringify([...others, valid]));
  return valid;
}

// Lists only the user's projects; demos are reachable through get() but stay read-only
export function createLocalProjectRepository(storage: KeyValueStorage): ProjectRepository {
  const projects = () => readList(storage, PROJECTS_STORAGE_KEY, ProjectSchema);
  return {
    async list() {
      return projects().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },
    async get(id) {
      return getDemoProject(id) ?? projects().find((project) => project.id === id);
    },
    async save(project) {
      if (isDemoId(project.id)) throw new ReadOnlyProjectError(project.id);
      return upsert<Project>(storage, PROJECTS_STORAGE_KEY, ProjectSchema, project);
    },
    async remove(id) {
      if (isDemoId(id)) throw new ReadOnlyProjectError(id);
      storage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects().filter((project) => project.id !== id)));
    },
    async listProgress(projectId) {
      const entries = readList(storage, PROGRESS_STORAGE_KEY, ProgressEntrySchema).filter((entry) => entry.projectId === projectId);
      return entries.sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
    },
    async saveProgress(entry) {
      return upsert<ProgressEntry>(storage, PROGRESS_STORAGE_KEY, ProgressEntrySchema, entry);
    },
  };
}
