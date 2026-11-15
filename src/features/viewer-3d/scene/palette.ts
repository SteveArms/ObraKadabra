import type { MeshType } from "@/lib/gltf";
import type { ElementStatus } from "@/schemas/schedule";

export const BUILDING_MATERIALS = ["footing", "concrete", "brick", "plaster", "slab"] as const;
export type BuildingMaterial = (typeof BUILDING_MATERIALS)[number];
export type ColorMode = "material" | "status";
export type MaterialState = "solid" | "in_progress" | "delayed";

export const BUILDING_MATERIAL_STYLES: Record<BuildingMaterial, { label: string; colorVar: string; swatchClass: string }> = {
  footing: { label: "Foundation", colorVar: "--color-material-footing", swatchClass: "bg-material-footing" },
  concrete: { label: "Concrete", colorVar: "--color-material-concrete", swatchClass: "bg-material-concrete" },
  brick: { label: "Brick", colorVar: "--color-material-brick", swatchClass: "bg-material-brick" },
  plaster: { label: "Plaster", colorVar: "--color-material-plaster", swatchClass: "bg-material-plaster" },
  slab: { label: "Slab", colorVar: "--color-material-slab", swatchClass: "bg-material-slab" },
};

// A wall shows its King Kong brick until its plaster is done, so the finished house reads as a house
export function buildingMaterialFor(type: MeshType, plastered: boolean): BuildingMaterial {
  if (type === "footing") return "footing";
  if (type === "column") return "concrete";
  if (type === "wall") return plastered ? "plaster" : "brick";
  if (type === "slab" || type === "roof") return "slab";
  return "plaster";
}

// In material mode the status only highlights: work in progress glows, delays tint red, everything else is plain material
export function materialStateFor(status: ElementStatus): MaterialState {
  if (status === "in_progress") return "in_progress";
  return status === "delayed" ? "delayed" : "solid";
}
