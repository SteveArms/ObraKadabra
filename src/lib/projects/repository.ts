import type { ProgressEntry } from "@/schemas/progress";
import type { Project } from "@/schemas/project";

// Single entry point for project persistence: localStorage now, Supabase later, same contract
export interface ProjectRepository {
  list(): Promise<Project[]>;
  get(id: string): Promise<Project | undefined>;
  save(project: Project): Promise<Project>;
  remove(id: string): Promise<void>;
  // Progress logs live beside the project, so demos (read-only plans) can still record site photos
  listProgress(projectId: string): Promise<ProgressEntry[]>;
  saveProgress(entry: ProgressEntry): Promise<ProgressEntry>;
}

export class ReadOnlyProjectError extends Error {
  constructor(id: string) {
    super(`Project "${id}" is a demo and cannot be changed`);
    this.name = "ReadOnlyProjectError";
  }
}
