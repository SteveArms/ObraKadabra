"use client";

import { useEffect, useMemo } from "react";
import { MeshStandardMaterial } from "three";
import { ELEMENT_STATUS_STYLES } from "@/lib/constants";
import type { ElementStatus } from "@/schemas/schedule";
import { cssColor } from "./css-color";

export type StatusMaterials = { byStatus: Record<ElementStatus, MeshStandardMaterial>; selected: MeshStandardMaterial };


// Selection skips the depth test so an element inside walls (a column, a footing) stays visible
// One material per status shared by every mesh, so recoloring never allocates and draw state stays small
export function useStatusMaterials(): StatusMaterials {
  const materials = useMemo(() => {
    const entries = Object.entries(ELEMENT_STATUS_STYLES).map(([status, style]) => [
      status,
      new MeshStandardMaterial({ color: cssColor(style.colorVar), roughness: 0.85 }),
    ]);
    const selected = new MeshStandardMaterial({
      color: cssColor("--color-inverse-primary"),
      emissive: cssColor("--color-primary-container"),
      emissiveIntensity: 0.35,
      roughness: 0.6,
      transparent: true,
      opacity: 0.95,
      depthTest: false,
    });
    return { byStatus: Object.fromEntries(entries) as Record<ElementStatus, MeshStandardMaterial>, selected };
  }, []);

  useEffect(
    () => () => {
      Object.values(materials.byStatus).forEach((material) => material.dispose());
      materials.selected.dispose();
    },
    [materials],
  );

  return materials;
}
