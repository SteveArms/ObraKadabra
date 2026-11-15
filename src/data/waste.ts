import type { Material } from "@/schemas/takeoff";

export const WASTE_FACTORS = {
  brick: 0.05,
  mortar: 0.1,
} as const;

export const MATERIAL_WASTE: Partial<Record<Material, number>> = {
  brick: WASTE_FACTORS.brick,
};
