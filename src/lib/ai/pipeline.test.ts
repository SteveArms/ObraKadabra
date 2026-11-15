import { describe, expect, it, vi } from "vitest";
import { wallLength } from "@/lib/geometry";
import type { PlanStreamEvent } from "@/schemas/plan-extraction";
import { PlanExtractionError, extractPlan } from "./extract";
import type { VisionModel } from "./model";
import { processPlanImage } from "./pipeline";
import { FIXTURE_JSON, TEST_IMAGE } from "./test-fixture";

function modelAnswering(...answers: string[]) {
  const calls: string[] = [];
  const model = vi.fn<VisionModel>(async ({ prompt }) => {
    calls.push(prompt);
    return answers[Math.min(calls.length - 1, answers.length - 1)];
  });
  return { model, calls };
}

async function collect(events: AsyncGenerator<PlanStreamEvent>): Promise<PlanStreamEvent[]> {
  const all: PlanStreamEvent[] = [];
  for await (const event of events) all.push(event);
  return all;
}

describe("extractPlan", () => {
  it("returns a valid answer on the first call", async () => {
    const { model } = modelAnswering(FIXTURE_JSON);
    await expect(extractPlan(model, TEST_IMAGE)).resolves.toMatchObject({ walls: expect.any(Array) });
    expect(model).toHaveBeenCalledTimes(1);
  });

  it("retries once with the validation errors as feedback", async () => {
    const { model, calls } = modelAnswering('{"walls": "nope"}', FIXTURE_JSON);
    await extractPlan(model, TEST_IMAGE);
    expect(model).toHaveBeenCalledTimes(2);
    expect(calls[1]).toContain("did not match the schema");
    expect(calls[1]).toContain("walls");
  });

  it("gives up after two invalid answers", async () => {
    const { model } = modelAnswering("not json", "still not json");
    await expect(extractPlan(model, TEST_IMAGE)).rejects.toBeInstanceOf(PlanExtractionError);
    expect(model).toHaveBeenCalledTimes(2);
  });
});

describe("processPlanImage", () => {
  it("emits each step with real counts and ends with the plan in meters", async () => {
    const { model } = modelAnswering(FIXTURE_JSON);
    const events = await collect(processPlanImage({ image: TEST_IMAGE, scale: 0.01, level: 1 }, model));
    expect(events.map((event) => (event.type === "step" ? event.step : event.type))).toEqual(["reading", "walls", "openings", "rooms", "result"]);
    expect(events[1]).toMatchObject({ counts: { total: 6, loadBearing: 5, partition: 1 } });
    expect(events[2]).toMatchObject({ counts: { doors: 3, windows: 2 } });
    const result = events.at(-1);
    if (result?.type !== "result") throw new Error("missing result");
    expect(result.plan.walls[0].id).toBe("M-1");
    expect(wallLength(result.plan.walls[0]) * result.plan.scale).toBeCloseTo(8);
    expect(result.plan.walls[0].thickness).toBe(0.25);
    expect(result.plan.openings.find((opening) => opening.id === "P-1")).toMatchObject({ wallId: "M-3", width: 0.9, height: 2.1 });
    expect(result.pending.map((item) => item.id)).toEqual(["M-5", "V-2", "C-5"]);
  });
});
