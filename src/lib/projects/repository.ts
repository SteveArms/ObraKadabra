import type { Project } from "@/schemas/project";

// Single entry point for project persistence: localStorage now, Supabase later, same contract
export interface ProjectRepository {
  list(): Promise<Project[]>;
  get(id: string): Promise<Project | undefined>;
  save(project: Project): Promise<Project>;
  remove(id: string): Promise<void>;
}

export class ReadOnlyProjectError extends Error {
  constructor(id: string) {
    super(`Project "${id}" is a demo and cannot be changed`);
    this.name = "ReadOnlyProjectError";
  }
}
