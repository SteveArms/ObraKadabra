import { describe, expect, it } from "vitest";
import { computeCost, computeTakeoffLines, elementTakeoff } from "./index";
import { makeTestPlan } from "./test-plan";

describe("elementTakeoff", () => {
  const plan = makeTestPlan();

  it("groups the quantities of one column", () => {
    const column = elementTakeoff(plan, "C-1");
    expect(column.quantities.map((entry) => entry.item)).toEqual(["structural_concrete", "rebar"]);
    expect(column.quantities[0].quantity).toBeCloseTo(0.25 * 0.25 * 2.6);
  });

  it("adds strip footing, beam, masonry and plaster to a wall", () => {
    const wall = elementTakeoff(plan, "M-1");
    const concrete = wall.quantities.find((entry) => entry.item === "structural_concrete");
    expect(concrete?.quantity).toBeCloseTo(0.25 * 0.2 * 4);
    expect(wall.quantities.map((entry) => entry.item)).toContain("cyclopean_concrete");
    expect(wall.cost).toBeCloseTo(computeCost(computeTakeoffLines(plan).filter((line) => line.elementId === "M-1")).total);
  });

  it("lists the bricks, cement and sand a wall consumes", () => {
    const materials = elementTakeoff(plan, "M-1").materials.map((entry) => entry.material);
    expect(materials).toEqual(expect.arrayContaining(["brick", "cement", "sand"]));
  });

  it("returns nothing for unknown ids", () => {
    expect(elementTakeoff(plan, "X-9")).toEqual({ quantities: [], materials: [], cost: 0 });
  });
});
