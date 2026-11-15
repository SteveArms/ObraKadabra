import { z } from "zod";
import { ProgressEntrySchema, type ProgressEntry } from "@/schemas/progress";
import { ProjectSchema, type Project } from "@/schemas/project";
import { getDemoProject, getSharedDemo, isDemoId } from "./demos";
import { ProjectNotFoundError, ReadOnlyProjectError, type ProjectRepository } from "./repository";
import { createShareToken } from "./share-token";

export const PROJECTS_STORAGE_KEY = "obrakadabra:projects";
export const PROGRESS_STORAGE_KEY = "obrakadabra:progress";
export const SHARES_STORAGE_KEY = "obrakadabra:shares";

// On this device a share token only maps to a project id; the link opens wherever this storage exists
const ShareSchema = z.object({ id: z.string().min(1), projectId: z.string().min(1) });

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

function storedProjects(storage: KeyValueStorage) {
  return readList(storage, PROJECTS_STORAGE_KEY, ProjectSchema);
}

function storedProgress(storage: KeyValueStorage, projectId: string) {
  return readList(storage, PROGRESS_STORAGE_KEY, ProgressEntrySchema)
    .filter((entry) => entry.projectId === projectId)
    .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
}

function localSharing(storage: KeyValueStorage): Pick<ProjectRepository, "share" | "getShared"> {
  const shares = () => readList(storage, SHARES_STORAGE_KEY, ShareSchema);
  return {
    async share(projectId) {
      if (isDemoId(projectId)) return projectId;
      if (!storedProjects(storage).some((project) => project.id === projectId)) throw new ProjectNotFoundError(projectId);
      const existing = shares().find((share) => share.projectId === projectId);
      return existing?.id ?? upsert(storage, SHARES_STORAGE_KEY, ShareSchema, { id: createShareToken(), projectId }).id;
    },
    async getShared(token) {
      const demo = getSharedDemo(token);
      if (demo) return demo;
      const projectId = shares().find((share) => share.id === token)?.projectId;
      const project = storedProjects(storage).find((item) => item.id === projectId);
      return project ? { project, progress: storedProgress(storage, project.id).filter((entry) => entry.approved) } : undefined;
    },
  };
}

// Lists only the user's projects; demos are reachable through get() but stay read-only
export function createLocalProjectRepository(storage: KeyValueStorage): ProjectRepository {
  const projects = () => storedProjects(storage);
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
      return storedProgress(storage, projectId);
    },
    async saveProgress(entry) {
      return upsert<ProgressEntry>(storage, PROGRESS_STORAGE_KEY, ProgressEntrySchema, entry);
    },
    ...localSharing(storage),
  };
}
