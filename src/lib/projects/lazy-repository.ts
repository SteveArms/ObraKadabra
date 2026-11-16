import type { ProjectRepository } from "./repository";

// Every call waits for the real repository, so its SDK is downloaded the first time a page touches projects, not on every visit
export function lazyRepository(load: () => Promise<ProjectRepository>): ProjectRepository {
  let pending: Promise<ProjectRepository> | undefined;
  const real = () => (pending ??= load());
  return {
    list: async () => (await real()).list(),
    get: async (id) => (await real()).get(id),
    save: async (project) => (await real()).save(project),
    remove: async (id) => (await real()).remove(id),
    listProgress: async (projectId) => (await real()).listProgress(projectId),
    saveProgress: async (entry) => (await real()).saveProgress(entry),
    share: async (projectId) => (await real()).share(projectId),
    getShared: async (token) => (await real()).getShared(token),
  };
}
