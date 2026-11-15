import { describe, expect, it } from "vitest";
import { EMPTY_PROGRESS, applyStep, readEvents, stepDetail, stepStatus } from "./progress";

describe("readEvents", () => {
  it("returns complete lines as events and keeps the partial tail", () => {
    const { events, rest } = readEvents('{"type":"step","step":"reading"}\n{"type":"err');
    expect(events).toEqual([{ type: "step", step: "reading" }]);
    expect(rest).toBe('{"type":"err');
  });

  it("skips lines that are not valid events", () => {
    expect(readEvents('nope\n{"type":"unknown"}\n').events).toEqual([]);
  });
});

describe("progress", () => {
  it("marks the next step active and finished steps done with their counts", () => {
    const progress = applyStep(EMPTY_PROGRESS, "reading", { dimensions: 2 }, true);
    expect(stepStatus(progress, "reading", false)).toBe("done");
    expect(stepStatus(progress, "walls", false)).toBe("active");
    expect(stepStatus(progress, "rooms", false)).toBe("queued");
    expect(stepDetail(progress, "reading")).toBe("2 dimension lines read on the plan.");
  });

  it("adds counts across floors and waits for the last floor to finish a step", () => {
    const first = applyStep(EMPTY_PROGRESS, "walls", { total: 6, loadBearing: 5, partition: 1 }, false);
    expect(stepStatus(first, "walls", false)).toBe("queued");
    const both = applyStep(first, "walls", { total: 4, loadBearing: 4, partition: 0 }, true);
    expect(stepDetail(both, "walls")).toBe("10 walls found: 9 load-bearing and 1 partition.");
  });

  it("stops showing an active step after a failure", () => {
    expect(stepStatus(EMPTY_PROGRESS, "reading", true)).toBe("queued");
  });
});
