import type { Material, TakeoffItem } from "@/schemas/takeoff";

// Reference prices in soles (S/) for Lima; editable per project later
export const MATERIAL_PRICES: Record<Material, number> = {
  cement: 32,
  sand: 70,
  gravel: 75,
  brick: 1.1,
  rebar: 4.6,
};

// Labor and equipment per takeoff unit (S/), including formwork for structural concrete
export const LABOR_PRICES: Record<TakeoffItem, number> = {
  excavation: 35,
  structural_concrete: 260,
  cyclopean_concrete: 90,
  rebar: 1.6,
  masonry_load_bearing: 32,
  masonry_partition: 28,
  plaster: 20,
  floor_screed: 16,
  light_roofing: 65,
};
