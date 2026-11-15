import { describe, expect, it } from "vitest";
import { buildingMaterialFor, materialStateFor } from "./palette";

describe("building palette", () => {
  it("gives each element its construction material", () => {
    expect(buildingMaterialFor("footing", false)).toBe("footing");
    expect(buildingMaterialFor("column", true)).toBe("concrete");
    expect(buildingMaterialFor("wall", false)).toBe("brick");
    expect(buildingMaterialFor("wall", true)).toBe("plaster");
    expect(buildingMaterialFor("roof", false)).toBe("slab");
    expect(buildingMaterialFor("slab", false)).toBe("slab");
  });

  it("keeps finished and pending work plain and highlights work in progress and delays", () => {
    expect(materialStateFor("done")).toBe("solid");
    expect(materialStateFor("not_started")).toBe("solid");
    expect(materialStateFor("in_progress")).toBe("in_progress");
    expect(materialStateFor("delayed")).toBe("delayed");
  });
});
