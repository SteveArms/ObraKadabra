import type { Material } from "@/schemas/takeoff";

type Mix = Partial<Record<Material, number>>;

// Materials per m³ of mix (cement in 42.5 kg bags, aggregates in m³)
export const CONCRETE_FC210: Mix = { cement: 9.73, sand: 0.52, gravel: 0.53 };
export const CYCLOPEAN_CONCRETE: Mix = { cement: 2.9, sand: 0.4, gravel: 0.4 };
export const MORTAR_1_5: Mix = { cement: 7.4, sand: 1.05 };

// King Kong 18-hole brick laid as stretcher course (soga) with 1.5 cm joints
export const BRICKS_PER_M2 = { load_bearing: 39, partition: 35 } as const;

// m³ of mortar per m² of finished work
export const MORTAR_M3_PER_M2 = {
  masonry: 0.025,
  plaster: 0.015,
  floor_screed: 0.04,
} as const;
