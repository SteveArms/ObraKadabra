"use client";

import { useEffect, useMemo } from "react";
import { MeshStandardMaterial } from "three";
import { ELEMENT_STATUS_STYLES } from "@/lib/constants";
import type { ElementStatus } from "@/schemas/schedule";
import { BUILDING_MATERIAL_STYLES, BUILDING_MATERIALS, EDGE_MATERIAL, type BuildingMaterial, type MaterialState } from "../scene";
import { cssColor } from "./css-color";

export type ViewerMaterials = {
  byStatus: Record<ElementStatus, MeshStandardMaterial>;
  building: (material: BuildingMaterial, state: MaterialState) => MeshStandardMaterial;
  selected: MeshStandardMaterial;
};

// Work in progress is translucent with a blue glow and delays glow red, on top of the element's own material
function buildingMaterial(material: BuildingMaterial, state: MaterialState): MeshStandardMaterial {
  const base = { color: cssColor(BUILDING_MATERIAL_STYLES[material].colorVar), roughness: material === "plaster" ? 0.95 : 0.85 };
  if (state === "in_progress") {
    return new MeshStandardMaterial({ ...base, transparent: true, opacity: 0.5, depthWrite: false, emissive: cssColor("--color-status-active"), emissiveIntensity: 0.45 });
  }
  if (state === "delayed") return new MeshStandardMaterial({ ...base, emissive: cssColor("--color-status-delayed"), emissiveIntensity: 0.5 });
  return new MeshStandardMaterial(base);
}

function statusMaterial(status: string, colorVar: string): MeshStandardMaterial {
  const translucent = status === "in_progress" ? { transparent: true, opacity: 0.55, depthWrite: false } : {};
  return new MeshStandardMaterial({ color: cssColor(colorVar), roughness: 0.85, ...translucent });
}

// Every material is created once and shared by all meshes, so switching week, mode or selection never allocates
export function useViewerMaterials(): ViewerMaterials {
  const materials = useMemo(() => {
    EDGE_MATERIAL.color.set(cssColor("--color-viewport"));
    const byStatus = Object.fromEntries(
      Object.entries(ELEMENT_STATUS_STYLES).map(([status, style]) => [status, statusMaterial(status, style.colorVar)]),
    ) as Record<ElementStatus, MeshStandardMaterial>;
    const cache = new Map<string, MeshStandardMaterial>();
    for (const material of BUILDING_MATERIALS) {
      for (const state of ["solid", "in_progress", "delayed"] as const) cache.set(`${material}:${state}`, buildingMaterial(material, state));
    }
    // Selection skips the depth test so an element inside walls (a column, a footing) stays visible
    const selected = new MeshStandardMaterial({
      color: cssColor("--color-inverse-primary"),
      emissive: cssColor("--color-primary-container"),
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.95,
      depthTest: false,
    });
    return { byStatus, selected, cache, building: (material: BuildingMaterial, state: MaterialState) => cache.get(`${material}:${state}`)! };
  }, []);

  useEffect(
    () => () => {
      [...Object.values(materials.byStatus), ...materials.cache.values(), materials.selected].forEach((material) => material.dispose());
    },
    [materials],
  );

  return materials;
}
