import { describe, expect, it, vi } from "vitest";
import { analyzePhoto, ProgressRequestError, TIMEOUT_ERROR } from "./api";

describe("analyzePhoto", () => {
  it("gives up with a clear message when the analysis takes too long", async () => {
    const hang = (_url: RequestInfo | URL, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => init?.signal?.addEventListener("abort", () => reject(init.signal?.reason)));
    vi.stubGlobal("fetch", vi.fn(hang));
    const context = { week: 6, levelLabel: "First floor", expected: [{ id: "C-1", type: "column" as const, stage: "columns" as const }] };
    const result = analyzePhoto(new Blob(["x"]), "obra.jpg", context, 20);
    await expect(result).rejects.toBeInstanceOf(ProgressRequestError);
    await expect(result).rejects.toThrow(TIMEOUT_ERROR);
    vi.unstubAllGlobals();
  });
});
