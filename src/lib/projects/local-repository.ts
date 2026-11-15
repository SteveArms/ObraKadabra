import { z } from "zod";
import { ProjectSchema, type Project } from "@/schemas/project";
import { getDemoProject, isDemoId } from "./demos";
import { ReadOnlyProjectError, type ProjectRepository } from "./repository";

export const PROJECTS_STORAGE_KEY = "obrakadabra:projects";

type KeyValueStorage = Pick<Storage, "getItem" | "setItem">;

function readProjects(storage: KeyValueStorage): Project[] {
  const raw = storage.getItem(PROJECTS_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    const list = z.array(z.unknown()).safeParse(parsed);
    if (!list.success) return [];
    return list.data.flatMap((item) => {
      const project = ProjectSchema.safeParse(item);
      return project.success ? [project.data] : [];
    });
  } catch {
    return [];
  }
}

function writeProjects(storage: KeyValueStorage, projects: Project[]): void {
  storage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
}

// Lists only the user's projects; demos are reachable through get() but stay read-only
export function createLocalProjectRepository(storage: KeyValueStorage): ProjectRepository {
  return {
    async list() {
      return readProjects(storage).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },
    async get(id) {
      return getDemoProject(id) ?? readProjects(storage).find((project) => project.id === id);
    },
    async save(project) {
      if (isDemoId(project.id)) throw new ReadOnlyProjectError(project.id);
      const valid = ProjectSchema.parse(project);
      const others = readProjects(storage).filter((item) => item.id !== valid.id);
      writeProjects(storage, [...others, valid]);
      return valid;
    },
    async remove(id) {
      if (isDemoId(id)) throw new ReadOnlyProjectError(id);
      writeProjects(storage, readProjects(storage).filter((project) => project.id !== id));
    },
  };
}
