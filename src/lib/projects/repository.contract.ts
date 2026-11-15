import { describe, expect, it } from "vitest";
import { makeTestPlan } from "@/lib/takeoff/test-plan";
import type { ProgressEntry } from "@/schemas/progress";
import type { Project } from "@/schemas/project";
import { ReadOnlyProjectError, type ProjectRepository } from "./repository";

// One behaviour for every ProjectRepository: each implementation runs this same suite against a fresh, empty store
export function makeProject(id: string, updatedAt: string): Project {
  return { id, name: `Project ${id}`, floorPlan: makeTestPlan(), createdAt: updatedAt, updatedAt };
}

export function makeEntry(id: string, projectId: string, recordedAt: string, approved = false): ProgressEntry {
  return { id, projectId, week: 7, levelLabel: "Floor 1", recordedAt, approved, hasPhoto: true, findings: [] };
}

export function describeProjectRepository(name: string, create: () => ProjectRepository) {
  describe(`${name} (ProjectRepository contract)`, () => {
    it("starts empty and lists saved projects, newest first", async () => {
      const repository = create();
      expect(await repository.list()).toEqual([]);
      await repository.save(makeProject("a", "2026-11-10T10:00:00.000Z"));
      await repository.save(makeProject("b", "2026-11-12T10:00:00.000Z"));
      expect((await repository.list()).map((project) => project.id)).toEqual(["b", "a"]);
    });

    it("gets, updates and removes a project", async () => {
      const repository = create();
      await repository.save(makeProject("a", "2026-11-10T10:00:00.000Z"));
      await repository.save({ ...makeProject("a", "2026-11-11T10:00:00.000Z"), name: "Renamed" });
      expect((await repository.get("a"))?.name).toBe("Renamed");
      expect(await repository.list()).toHaveLength(1);
      await repository.remove("a");
      expect(await repository.get("a")).toBeUndefined();
    });

    it("serves demos read-only and keeps them out of the list", async () => {
      const repository = create();
      expect((await repository.get("casa-1-piso-90"))?.floorPlan.meta.levels).toBe(1);
      expect(await repository.list()).toEqual([]);
      await expect(repository.save(makeProject("casa-1-piso-90", "2026-11-10T10:00:00.000Z"))).rejects.toThrow(ReadOnlyProjectError);
      await expect(repository.remove("vivienda-2-pisos-120")).rejects.toThrow(ReadOnlyProjectError);
    });

    it("rejects invalid projects on save", async () => {
      await expect(create().save(makeProject("a", "not a date"))).rejects.toThrow();
    });

    it("keeps progress logs per project, newest first, also for demos", async () => {
      const repository = create();
      await repository.saveProgress(makeEntry("e1", "casa-1-piso-90", "2026-11-15T10:00:00.000Z"));
      await repository.saveProgress(makeEntry("e2", "casa-1-piso-90", "2026-11-16T10:00:00.000Z"));
      await repository.saveProgress(makeEntry("e1", "casa-1-piso-90", "2026-11-15T10:00:00.000Z", true));
      await repository.saveProgress(makeEntry("e3", "other", "2026-11-15T10:00:00.000Z"));
      const entries = await repository.listProgress("casa-1-piso-90");
      expect(entries.map((item) => item.id)).toEqual(["e2", "e1"]);
      expect(entries[1].approved).toBe(true);
    });

    it("creates one share token per project and reuses it", async () => {
      const repository = create();
      await repository.save(makeProject("a", "2026-11-10T10:00:00.000Z"));
      await repository.save(makeProject("b", "2026-11-10T10:00:00.000Z"));
      const token = await repository.share("a");
      expect(token.length).toBeGreaterThanOrEqual(16);
      expect(await repository.share("a")).toBe(token);
      expect(await repository.share("b")).not.toBe(token);
      expect(await repository.share("casa-1-piso-90")).toBe("casa-1-piso-90");
      await expect(repository.share("missing")).rejects.toThrow();
    });

    it("opens a shared project by token with its approved logs only", async () => {
      const repository = create();
      await repository.save(makeProject("a", "2026-11-10T10:00:00.000Z"));
      await repository.saveProgress(makeEntry("ok", "a", "2026-11-15T10:00:00.000Z", true));
      await repository.saveProgress(makeEntry("draft", "a", "2026-11-16T10:00:00.000Z"));
      const shared = await repository.getShared(await repository.share("a"));
      expect(shared?.project.id).toBe("a");
      expect(shared?.progress.map((entry) => entry.id)).toEqual(["ok"]);
      expect((await repository.getShared("casa-1-piso-90"))?.project.name).toBeTruthy();
      expect(await repository.getShared("not-a-real-token-123")).toBeUndefined();
    });
  });
}
