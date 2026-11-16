import { Box3, MeshBasicMaterial } from "three";
import { describe, expect, it } from "vitest";
import { wallArea } from "@/lib/geometry";
import { demoProjects } from "@/lib/projects";
import { buildPlanScene } from "./plan-scene";
import { levelClearHeight } from "@/lib/plan/elevations";
import { buildElementMesh } from "./three-objects";
import { wallSpans } from "./wall-boxes";

const material = new MeshBasicMaterial();

describe.each(demoProjects())("buildPlanScene for $id", ({ floorPlan: plan }) => {
  const scene = buildPlanScene(plan);

  it("creates one named element per footing, column, wall, slab and roof", () => {
    const expected = [
      ...plan.footings.map((item) => `footing_${item.id}`),
      ...plan.columns.map((item) => `column_${item.id}`),
      ...plan.walls.map((item) => `wall_${item.id}`),
      ...plan.slabs.map((item) => `slab_${item.id}`),
      ...plan.roofs.map((item) => `roof_${item.id}`),
    ];
    expect(scene.map((element) => element.key).sort()).toEqual(expected.sort());
  });

  it("builds exactly one mesh per element, named <type>_<id>", () => {
    const meshes = scene.map((element) => buildElementMesh(element, material));
    expect(meshes).toHaveLength(scene.length);
    meshes.forEach((mesh, index) => expect(mesh.name).toBe(scene[index].key));
  });

  it("leaves holes in walls that match the takeoff area", () => {
    for (const wall of plan.walls) {
      const element = scene.find((item) => item.key === `wall_${wall.id}`)!;
      if (element.shape.kind !== "boxes") throw new Error("walls are boxes");
      const faces = element.shape.boxes.reduce((sum, box) => sum + box.size[0] * box.size[1], 0);
      const height = levelClearHeight(plan, wall.level);
      expect(faces, wall.id).toBeCloseTo(wallArea(wall, height, plan.openings, plan.meta.scale), 5);
    }
  });
});

describe("element geometry", () => {
  const plan = demoProjects()[0].floorPlan;
  const scene = buildPlanScene(plan);

  it("places footings below ground and the roof on top", () => {
    const box = (key: string) => new Box3().setFromObject(buildElementMesh(scene.find((item) => item.key === key)!, material));
    expect(box("footing_Z-1").max.y).toBeLessThan(0);
    const roof = box("roof_T1");
    expect(roof.max.y).toBeCloseTo(plan.meta.floorHeight);
    expect(roof.max.x - roof.min.x).toBeCloseTo(9);
    expect(roof.max.z - roof.min.z).toBeCloseTo(10);
  });
});

describe("wallSpans", () => {
  it("splits a wall around a door and a window", () => {
    const spans = wallSpans(6, 2.4, [
      { id: "V-1", wallId: "M-1", kind: "window", offset: 3.5, width: 1.5, height: 1.2, sill: 0.9 },
      { id: "P-1", wallId: "M-1", kind: "door", offset: 1, width: 1, height: 2.1, sill: 0 },
    ]);
    expect(spans).toEqual([
      { from: 0, to: 1, bottom: 0, top: 2.4 },
      { from: 1, to: 2, bottom: 2.1, top: 2.4 },
      { from: 2, to: 3.5, bottom: 0, top: 2.4 },
      { from: 3.5, to: 5, bottom: 0, top: 0.9 },
      { from: 3.5, to: 5, bottom: 2.1, top: 2.4 },
      { from: 5, to: 6, bottom: 0, top: 2.4 },
    ]);
  });
});
