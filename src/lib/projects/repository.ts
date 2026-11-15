import type { ProgressEntry } from "@/schemas/progress";
import type { Project } from "@/schemas/project";
import type { SharedProject } from "@/schemas/shared";

// Single entry point for project persistence: localStorage on this device or Supabase, same contract
export interface ProjectRepository {
  list(): Promise<Project[]>;
  get(id: string): Promise<Project | undefined>;
  save(project: Project): Promise<Project>;
  remove(id: string): Promise<void>;
  // Progress logs live beside the project, so demos (read-only plans) can still record site photos
  listProgress(projectId: string): Promise<ProgressEntry[]>;
  saveProgress(entry: ProgressEntry): Promise<ProgressEntry>;
  // The token is created on the first share and reused afterwards; a demo's token is its own id
  share(projectId: string): Promise<string>;
  getShared(token: string): Promise<SharedProject | undefined>;
}

export class ReadOnlyProjectError extends Error {
  constructor(id: string) {
    super(`Project "${id}" is a demo and cannot be changed`);
    this.name = "ReadOnlyProjectError";
  }
}

export class ProjectNotFoundError extends Error {
  constructor(id: string) {
    super(`Project "${id}" does not exist`);
    this.name = "ProjectNotFoundError";
  }
}
