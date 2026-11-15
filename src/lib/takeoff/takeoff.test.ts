import { describe, expect, it } from "vitest";
import { LABOR_PRICES, MATERIAL_PRICES } from "@/data/prices";
import { BRICKS_PER_M2 } from "@/data/mixes";
import { WASTE_FACTORS } from "@/data/waste";
import { builtArea, computeCost, computeMaterials, computeTakeoffLines, estimateDurationWeeks, summarizeTakeoff } from "./index";
import { makeTestPlan } from "./test-plan";

const find = (item: string, elementType: string) => (line: { item: string; elementType: string }) =>
  line.item === item && line.elementType === elementType;

describe("computeTakeoffLines", () => {
  const lines = computeTakeoffLines(makeTestPlan());

  it("measures each structural element", () => {
    expect(lines.find(find("structural_concrete", "footing"))?.quantity).toBeCloseTo(0.6);
    expect(lines.find(find("cyclopean_concrete", "footing"))?.quantity).toBeCloseTo(0.4 * 0.8 * 4);
    expect(lines.find(find("structural_concrete", "column"))?.quantity).toBeCloseTo(0.25 * 0.25 * 2.6);
    expect(lines.find(find("structural_concrete", "beam"))?.quantity).toBeCloseTo(0.25 * 0.2 * 4);
    expect(lines.find(find("structural_concrete", "roof"))?.quantity).toBeCloseTo(16 * 0.0875);
  });

  it("measures masonry net of openings and plaster on both faces", () => {
    const masonry = 4 * 2.4 - 1 * 2.1;
    expect(lines.find(find("masonry_load_bearing", "wall"))?.quantity).toBeCloseTo(masonry);
    expect(lines.find(find("plaster", "wall"))?.quantity).toBeCloseTo(masonry * 2);
    expect(lines.find(find("floor_screed", "room"))?.quantity).toBeCloseTo(16);
  });

  it("assigns every line to its stage", () => {
    expect(lines.find(find("rebar", "column"))?.stage).toBe("columns");
    expect(lines.find(find("masonry_load_bearing", "wall"))?.stage).toBe("walls");
    expect(lines.find(find("plaster", "wall"))?.stage).toBe("finishes");
  });

  it("uses light roofing instead of concrete for metal sheet roofs", () => {
    const metal = computeTakeoffLines(makeTestPlan({ roofType: "metal_sheet" }));
    expect(metal.filter((line) => line.elementType === "roof").map((line) => line.item)).toEqual(["light_roofing"]);
  });

  it("converts plan units with the scale", () => {
    const plan = makeTestPlan({ scale: 0.5 });
    expect(builtArea(plan)).toBeCloseTo(4);
  });
});

describe("computeMaterials", () => {
  it("applies the brick waste factor", () => {
    const lines = computeTakeoffLines(makeTestPlan()).filter((line) => line.item === "masonry_load_bearing");
    const bricks = computeMaterials(lines).find((entry) => entry.material === "brick");
    expect(bricks?.quantity).toBeCloseTo(lines[0].quantity * BRICKS_PER_M2.load_bearing * (1 + WASTE_FACTORS.brick));
  });
});

describe("computeCost", () => {
  it("adds materials and labor, and the stages add up to the total", () => {
    const lines = computeTakeoffLines(makeTestPlan());
    const cost = computeCost(lines);
    const rebar = lines.filter((line) => line.item === "rebar");
    expect(computeCost(rebar).total).toBeCloseTo(
      rebar.reduce((sum, line) => sum + line.quantity * (MATERIAL_PRICES.rebar + LABOR_PRICES.rebar), 0),
    );
    const stageSum = Object.values(cost.byStage).reduce((sum, value) => sum + value, 0);
    expect(stageSum).toBeCloseTo(cost.total);
  });
});

describe("estimateDurationWeeks and summarizeTakeoff", () => {
  it("rounds each stage up to whole weeks", () => {
    const lines = computeTakeoffLines(makeTestPlan());
    expect(estimateDurationWeeks(lines)).toBe(6);
    expect(estimateDurationWeeks([])).toBe(0);
  });

  it("summarizes area, floors, cost and duration", () => {
    const summary = summarizeTakeoff(makeTestPlan());
    expect(summary).toMatchObject({ builtArea: 16, levels: 1, durationWeeks: 6 });
    expect(summary.cost.total).toBeGreaterThan(0);
  });
});
