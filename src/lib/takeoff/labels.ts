import type { TakeoffItem, Unit } from "@/schemas/takeoff";

export const TAKEOFF_ITEM_LABELS: Record<TakeoffItem, string> = {
  excavation: "Excavation",
  structural_concrete: "Concrete f'c 210",
  cyclopean_concrete: "Cyclopean concrete",
  rebar: "Rebar",
  masonry_load_bearing: "Load-bearing masonry",
  masonry_partition: "Partition masonry",
  plaster: "Plaster",
  floor_screed: "Floor screed",
  light_roofing: "Light roofing",
};

export const UNIT_LABELS: Record<Unit, string> = { m3: "m³", m2: "m²", kg: "kg", bag: "bags", unit: "units" };
