import { describe, expect, it } from "vitest";
import { createLocalProjectRepository, PROJECTS_STORAGE_KEY } from "./local-repository";
import { describeProjectRepository, makeProject } from "./repository.contract";

function makeStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
  };
}

describeProjectRepository("createLocalProjectRepository", () => createLocalProjectRepository(makeStorage()));

describe("createLocalProjectRepository", () => {
  it("ignores corrupt or invalid stored data", async () => {
    const storage = makeStorage();
    storage.setItem(PROJECTS_STORAGE_KEY, "{not json");
    expect(await createLocalProjectRepository(storage).list()).toEqual([]);
    storage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify([{ id: "x" }, makeProject("ok", "2026-11-10T10:00:00.000Z")]));
    expect((await createLocalProjectRepository(storage).list()).map((project) => project.id)).toEqual(["ok"]);
  });
});
