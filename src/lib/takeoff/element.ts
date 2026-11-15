import type { FloorPlan } from "@/schemas/floor-plan";
import type { TakeoffItem, Unit } from "@/schemas/takeoff";
import { computeCost } from "./cost";
import { computeTakeoffLines } from "./summary";

export type ElementTakeoff = {
  quantities: { item: TakeoffItem; unit: Unit; quantity: number }[];
  cost: number;
};

// Everything measured for one element id: a wall also carries its strip footing and confining beam
export function elementTakeoff(plan: FloorPlan, elementId: string): ElementTakeoff {
  const lines = computeTakeoffLines(plan).filter((line) => line.elementId === elementId);
  const totals = new Map<TakeoffItem, { unit: Unit; quantity: number }>();
  for (const line of lines) {
    const current = totals.get(line.item);
    totals.set(line.item, { unit: line.unit, quantity: (current?.quantity ?? 0) + line.quantity });
  }
  return {
    quantities: [...totals].map(([item, value]) => ({ item, ...value })),
    cost: computeCost(lines).total,
  };
}
