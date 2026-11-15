import { MATERIAL_PRICES } from "@/data/prices";
import { computeMaterials } from "@/lib/takeoff";
import type { Schedule } from "@/schemas/schedule";
import type { Material, TakeoffLine, Unit } from "@/schemas/takeoff";
import { taskFraction } from "./curve";
import { weekEndDay } from "./status";

export type WeekMaterial = { material: Material; unit: Unit; quantity: number; cost: number };

// Materials consumed during one week: each task contributes the share of its quantities worked that week
export function materialsForWeek(schedule: Schedule, week: number): WeekMaterial[] {
  const [from, to] = [weekEndDay(week - 1), weekEndDay(week)];
  const lines: TakeoffLine[] = schedule.tasks.flatMap((task) => {
    const share = taskFraction(task, to) - taskFraction(task, from);
    return share > 0 ? task.lines.map((line) => ({ ...line, quantity: line.quantity * share })) : [];
  });
  return computeMaterials(lines)
    .filter((entry) => entry.quantity > 0)
    .map((entry) => ({ ...entry, cost: entry.quantity * MATERIAL_PRICES[entry.material] }));
}
