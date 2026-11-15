import type { TakeoffItem } from "@/schemas/takeoff";

// Daily output of one crew per takeoff item; reference values for confined masonry homes in Peru
export const YIELDS_PER_CREW_DAY: Record<TakeoffItem, number> = {
  structural_concrete: 4,
  cyclopean_concrete: 10,
  rebar: 250,
  masonry_load_bearing: 10,
  masonry_partition: 12,
  plaster: 12,
  floor_screed: 30,
  light_roofing: 40,
};

export const WORKDAYS_PER_WEEK = 6;
