import { describe, expect, it, vi } from "vitest";
import fixture from "../../../e2e/fixtures/avance-columnas.json";
import type { ProgressContext } from "@/schemas/progress";
import { fixtureName } from "./fixture";
import type { VisionModel } from "./model";
import { ProgressAnalysisError, analyzeProgress } from "./progress";
import { TEST_IMAGE } from "./test-fixture";

const CONTEXT: ProgressContext = {
  week: 7,
  levelLabel: "Floor 1",
  expected: [
    { id: "C-1", type: "column", stage: "columns" },
    { id: "C-2", type: "column", stage: "columns" },
    { id: "M-3", type: "wall", stage: "walls" },
  ],
};

function modelAnswering(...answers: string[]) {
  const prompts: string[] = [];
  const model = vi.fn<VisionModel>(async ({ prompt }) => {
    prompts.push(prompt);
    return answers[Math.min(prompts.length - 1, answers.length - 1)];
  });
  return { model, prompts };
}

describe("analyzeProgress", () => {
  it("returns the findings and lists the expected elements in the prompt", async () => {
    const { model, prompts } = modelAnswering(JSON.stringify(fixture));
    const analysis = await analyzeProgress(model, TEST_IMAGE, CONTEXT);
    expect(analysis.findings.map((finding) => finding.elementId)).toEqual(["C-1", "C-2", "M-3"]);
    expect(prompts[0]).toContain("- M-3 (wall, stage walls)");
  });

  it("retries when the model names an element that was not expected", async () => {
    const stray = { findings: [{ ...fixture.findings[0], elementId: "C-9" }] };
    const { model, prompts } = modelAnswering(JSON.stringify(stray), JSON.stringify(fixture));
    await analyzeProgress(model, TEST_IMAGE, CONTEXT);
    expect(prompts[1]).toContain("C-9");
  });

  it("gives up after two invalid answers", async () => {
    const { model } = modelAnswering("nope", '{"findings": []}');
    await expect(analyzeProgress(model, TEST_IMAGE, CONTEXT)).rejects.toBeInstanceOf(ProgressAnalysisError);
    expect(model).toHaveBeenCalledTimes(2);
  });

  it("maps obra-<name> photos to avance-<name> answers in demo mode", () => {
    expect(fixtureName("obra-columnas.jpg", "progress")).toBe("avance-columnas.json");
    expect(fixtureName("IMG_0042.jpg", "progress")).toBe("avance-columnas.json");
  });
});
