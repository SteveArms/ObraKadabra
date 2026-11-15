import { Group, Mesh, MeshBasicMaterial, BoxGeometry } from "three";
import { describe, expect, it } from "vitest";
import { DEMO_PROJECTS } from "@/lib/projects";
import { findElementKey, registerElements } from "./registry";

function named(name: string, child?: Mesh) {
  const group = new Group();
  group.name = name;
  if (child) group.add(child);
  return group;
}

describe("registerElements", () => {
  const plan = DEMO_PROJECTS[1].floorPlan;
  const glbMesh = new Mesh(new BoxGeometry(), new MeshBasicMaterial());
  const root = new Group();
  root.add(named("column_C-1", glbMesh), named("wall_M-12.001"), named("roof_T1"), named("Camera"), named("wall_M-99"));
  const entries = registerElements(root, plan);

  it("maps <type>_<id> objects to plan ids and levels", () => {
    expect(entries.map(({ key, id, type, level }) => ({ key, id, type, level }))).toEqual([
      { key: "column_C-1", id: "C-1", type: "column", level: 1 },
      { key: "wall_M-12", id: "M-12", type: "wall", level: 2 },
      { key: "roof_T1", id: "T1", type: "roof", level: 2 },
    ]);
  });

  it("resolves a nested mesh back to its element", () => {
    expect(findElementKey(glbMesh)).toBe("column_C-1");
    expect(findElementKey(root)).toBeUndefined();
  });
});
