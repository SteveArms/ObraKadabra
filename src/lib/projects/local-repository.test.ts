import { beforeEach, describe, expect, it } from "vitest";
import { makeTestPlan } from "@/lib/takeoff/test-plan";
import type { Project } from "@/schemas/project";
import { createLocalProjectRepository, PROJECTS_STORAGE_KEY } from "./local-repository";
import { ReadOnlyProjectError } from "./repository";

function makeStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
  };
}

function makeProject(id: string, updatedAt: string): Project {
  return { id, name: `Project ${id}`, floorPlan: makeTestPlan(), createdAt: updatedAt, updatedAt };
}

describe("createLocalProjectRepository", () => {
  let storage: ReturnType<typeof makeStorage>;

  beforeEach(() => {
    storage = makeStorage();
  });

  it("starts empty and lists saved projects, newest first", async () => {
    const repository = createLocalProjectRepository(storage);
    expect(await repository.list()).toEqual([]);
    await repository.save(makeProject("a", "2026-11-10T10:00:00.000Z"));
    await repository.save(makeProject("b", "2026-11-12T10:00:00.000Z"));
    expect((await repository.list()).map((project) => project.id)).toEqual(["b", "a"]);
  });

  it("gets, updates and removes a project", async () => {
    const repository = createLocalProjectRepository(storage);
    await repository.save(makeProject("a", "2026-11-10T10:00:00.000Z"));
    await repository.save({ ...makeProject("a", "2026-11-11T10:00:00.000Z"), name: "Renamed" });
    expect((await repository.get("a"))?.name).toBe("Renamed");
    expect(await repository.list()).toHaveLength(1);
    await repository.remove("a");
    expect(await repository.get("a")).toBeUndefined();
  });

  it("serves demos read-only and keeps them out of the list", async () => {
    const repository = createLocalProjectRepository(storage);
    expect((await repository.get("casa-1-piso-90"))?.floorPlan.meta.levels).toBe(1);
    expect(await repository.list()).toEqual([]);
    await expect(repository.save(makeProject("casa-1-piso-90", "2026-11-10T10:00:00.000Z"))).rejects.toThrow(ReadOnlyProjectError);
    await expect(repository.remove("vivienda-2-pisos-120")).rejects.toThrow(ReadOnlyProjectError);
  });

  it("ignores corrupt or invalid stored data", async () => {
    storage.setItem(PROJECTS_STORAGE_KEY, "{not json");
    expect(await createLocalProjectRepository(storage).list()).toEqual([]);
    storage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify([{ id: "x" }, makeProject("ok", "2026-11-10T10:00:00.000Z")]));
    expect((await createLocalProjectRepository(storage).list()).map((project) => project.id)).toEqual(["ok"]);
  });

  it("rejects invalid projects on save", async () => {
    const repository = createLocalProjectRepository(storage);
    await expect(repository.save({ ...makeProject("a", "not a date") })).rejects.toThrow();
  });
});
