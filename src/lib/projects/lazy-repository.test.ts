import { describe, expect, it, vi } from "vitest";
import { createFakeSupabase } from "@/lib/supabase/fake-client";
import { createSupabaseProjectRepository } from "@/lib/supabase/project-repository";
import { lazyRepository } from "./lazy-repository";
import { describeProjectRepository } from "./repository.contract";

describeProjectRepository("lazyRepository", () => lazyRepository(async () => createSupabaseProjectRepository(createFakeSupabase().client)));

describe("lazyRepository", () => {
  it("loads the real repository once, on the first call", async () => {
    const load = vi.fn(async () => createSupabaseProjectRepository(createFakeSupabase().client));
    const repository = lazyRepository(load);
    expect(load).not.toHaveBeenCalled();
    await Promise.all([repository.list(), repository.get("casa-1-piso-90")]);
    expect(load).toHaveBeenCalledTimes(1);
  });
});
