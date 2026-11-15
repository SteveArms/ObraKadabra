import { describe, expect, it } from "vitest";
import { describeProjectRepository, makeEntry, makeProject } from "@/lib/projects/repository.contract";
import { createFakeSupabase } from "./fake-client";
import { createSupabaseProjectRepository } from "./project-repository";

describeProjectRepository("createSupabaseProjectRepository", () => createSupabaseProjectRepository(createFakeSupabase().client));

describe("createSupabaseProjectRepository", () => {
  it("reads nothing and creates no user until the first write", async () => {
    const { client, db } = createFakeSupabase();
    const repository = createSupabaseProjectRepository(client);
    expect(await repository.list()).toEqual([]);
    expect(await repository.get("a")).toBeUndefined();
    expect(db.userId).toBeUndefined();
    await repository.save(makeProject("a", "2026-11-10T10:00:00.000Z"));
    expect(db.userId).toBe("user-1");
  });

  it("keeps each anonymous owner's projects private, but opens them by share token", async () => {
    const { client, db } = createFakeSupabase();
    const repository = createSupabaseProjectRepository(client);
    await repository.save(makeProject("a", "2026-11-10T10:00:00.000Z"));
    await repository.saveProgress(makeEntry("ok", "a", "2026-11-15T10:00:00.000Z", true));
    const token = await repository.share("a");
    db.signIn();
    expect(await repository.get("a")).toBeUndefined();
    await expect(repository.save(makeProject("a", "2026-11-11T10:00:00.000Z"))).rejects.toThrow();
    expect((await repository.getShared(token))?.progress.map((entry) => entry.id)).toEqual(["ok"]);
  });

  it("reads Postgres timestamps with an offset and skips rows that no longer match the schema", async () => {
    const { client, db } = createFakeSupabase();
    const repository = createSupabaseProjectRepository(client);
    await repository.save(makeProject("a", "2026-11-10T10:00:00.000Z"));
    Object.assign(db.rows("projects")[0], { updated_at: "2026-11-12 10:00:00+00:00" });
    db.rows("projects").push({ id: "broken", owner_id: db.userId, name: "x", floor_plan: {} });
    const [project, ...rest] = await repository.list();
    expect(project.updatedAt).toBe("2026-11-12T10:00:00.000Z");
    expect(rest).toEqual([]);
  });
});
