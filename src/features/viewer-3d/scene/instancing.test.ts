import { InstancedMesh, Matrix4, MeshStandardMaterial, Vector3 } from "three";
import { describe, expect, it } from "vitest";
import { DEMO_PROJECTS } from "@/lib/projects";
import { applyAppearance } from "./appearance";
import { buildPlanObjects } from "./instancing";
import { buildPlanScene } from "./plan-scene";
import { findElementKey } from "./registry";

const plan = DEMO_PROJECTS[1].floorPlan;
const elements = buildPlanScene(plan);
const idle = new MeshStandardMaterial({ color: "#9aa0a6" });
const selected = new MeshStandardMaterial({ color: "#b7c4ff" });

function scaleOf(mesh: InstancedMesh, index: number) {
  const matrix = new Matrix4();
  mesh.getMatrixAt(index, matrix);
  return new Vector3().setFromMatrixScale(matrix);
}

describe("buildPlanObjects", () => {
  it("keeps separate meshes below the threshold", () => {
    const model = buildPlanObjects(elements, idle);
    expect(model.objects.some((object) => object instanceof InstancedMesh)).toBe(false);
    expect(model.entries).toHaveLength(elements.length);
  });

  describe("with instanced columns", () => {
    const model = buildPlanObjects(elements, idle, 1);
    const instanced = model.objects.find((object): object is InstancedMesh => object instanceof InstancedMesh)!;
    const columns = model.entries.filter((entry) => entry.type === "column");

    it("draws every column with one instanced mesh and keeps one entry per element", () => {
      expect(instanced.count).toBe(plan.columns.length);
      expect(model.entries.map((entry) => entry.key)).toEqual(elements.map((element) => element.key));
      expect(findElementKey(instanced, 2)).toBe(columns[2].key);
    });

    it("hides instances above the cut and swaps the selected one for its proxy", () => {
      const upper = columns.find((entry) => entry.level === 2)!;
      const lower = columns.find((entry) => entry.level === 1)!;
      applyAppearance(model.entries, {
        isVisible: (entry) => entry.level <= 1,
        selectedKey: lower.key,
        materialFor: (entry) => (entry.key === lower.key ? selected : idle),
      });
      const index = (key: string) => columns.findIndex((entry) => entry.key === key);
      expect(scaleOf(instanced, index(upper.key)).x).toBe(0);
      expect(scaleOf(instanced, index(lower.key)).x).toBe(0);
      expect(lower.object.visible).toBe(true);
      expect(upper.object.visible).toBe(false);
      const other = columns.find((entry) => entry.level === 1 && entry.key !== lower.key)!;
      expect(scaleOf(instanced, index(other.key)).x).toBeGreaterThan(0);
    });
  });
});
