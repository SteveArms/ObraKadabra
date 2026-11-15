import { describe, expect, it } from "vitest";
import { DEMO_PROJECTS } from "@/lib/projects";
import { builtArea } from "@/lib/takeoff";

const EXPECTED = { "casa-1-piso-90": { area: 90, levels: 1 }, "vivienda-2-pisos-120": { area: 120, levels: 2 } };

describe.each(DEMO_PROJECTS)("demo $id", (demo) => {
  const plan = demo.floorPlan;

  it("has the advertised built area and floors", () => {
    const expected = EXPECTED[demo.id as keyof typeof EXPECTED];
    expect(builtArea(plan)).toBeCloseTo(expected.area);
    expect(plan.meta.levels).toBe(expected.levels);
  });

  it("uses unique ids per element type", () => {
    for (const items of [plan.walls, plan.openings, plan.columns, plan.footings, plan.rooms]) {
      const ids = items.map((item) => item.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("places every opening inside an existing wall", () => {
    for (const opening of plan.openings) {
      const wall = plan.walls.find((item) => item.id === opening.wallId);
      expect(wall, opening.id).toBeDefined();
      const run = Math.hypot(wall!.x2 - wall!.x1, wall!.y2 - wall!.y1) * plan.meta.scale;
      expect(opening.offset + opening.width, opening.id).toBeLessThanOrEqual(run);
    }
  });

  it("keeps every level within the declared floors", () => {
    const levels = [...plan.walls, ...plan.columns, ...plan.rooms, ...plan.slabs, ...plan.roofs].map((item) => item.level);
    expect(Math.max(...levels)).toBe(plan.meta.levels);
  });
});
