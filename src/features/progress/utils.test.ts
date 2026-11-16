import { describe, expect, it } from "vitest";
import { demoProjects } from "@/lib/projects";
import { scheduleFor } from "@/lib/schedule";
import { expectedElements, levelChoices, planForFindings } from "./utils";

const plan = demoProjects()[0].floorPlan;
const schedule = scheduleFor(plan);
const [firstFloor, roof] = levelChoices(plan.meta.levels);

describe("levelChoices", () => {
  it("offers each floor and the roof", () => {
    expect(levelChoices(2).map((choice) => choice.label)).toEqual(["First floor", "Second floor", "Roof"]);
    expect(roof).toMatchObject({ id: "roof", stages: ["roof"] });
  });
});

describe("expectedElements", () => {
  it("lists the first-floor elements planned up to next week", () => {
    const expected = expectedElements(plan, schedule, 7, firstFloor, undefined, new Set());
    expect(expected).toEqual(expect.arrayContaining([{ id: "C-1", type: "column", stage: "columns" }, { id: "M-3", type: "wall", stage: "walls" }]));
    expect(expected.every((element) => element.stage !== "roof")).toBe(true);
  });

  it("skips elements already reported finished and narrows to the chosen room", () => {
    const all = expectedElements(plan, schedule, 7, firstFloor, undefined, new Set());
    expect(expectedElements(plan, schedule, 7, firstFloor, undefined, new Set(["column_C-1"])).some((element) => element.id === "C-1")).toBe(false);
    const bathroom = expectedElements(plan, schedule, 7, firstFloor, "R-5", new Set());
    expect(bathroom.length).toBeGreaterThan(0);
    expect(bathroom.length).toBeLessThan(all.length);
  });
});

describe("planForFindings", () => {
  it("keeps only the reported elements", () => {
    const filtered = planForFindings(plan, [{ elementId: "C-1", type: "column" }, { elementId: "M-3", type: "wall" }]);
    expect(filtered.columns.map((column) => column.id)).toEqual(["C-1"]);
    expect(filtered.walls.map((wall) => wall.id)).toEqual(["M-3"]);
    expect(filtered.slabs).toEqual([]);
  });
});
