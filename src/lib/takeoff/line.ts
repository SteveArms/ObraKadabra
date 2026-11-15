import type { Stage } from "@/schemas/schedule";
import type { ElementType, TakeoffItem, TakeoffLine } from "@/schemas/takeoff";

const ITEM_UNITS: Record<TakeoffItem, TakeoffLine["unit"]> = {
  excavation: "m3",
  structural_concrete: "m3",
  cyclopean_concrete: "m3",
  rebar: "kg",
  masonry_load_bearing: "m2",
  masonry_partition: "m2",
  plaster: "m2",
  floor_screed: "m2",
  light_roofing: "m2",
};

export function makeLine(
  elementType: ElementType,
  elementId: string,
  stage: Stage,
  item: TakeoffItem,
  quantity: number,
): TakeoffLine {
  return { elementType, elementId, stage, item, unit: ITEM_UNITS[item], quantity };
}
