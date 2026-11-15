import { MATERIAL_PRICES } from "@/data/prices";
import { formatSoles } from "@/lib/format";
import { taskFraction, weekEndDay, type WeekMaterial } from "@/lib/schedule";
import { computeCost, MATERIAL_LABELS, UNIT_LABELS } from "@/lib/takeoff";
import type { Schedule } from "@/schemas/schedule";
import type { TakeoffItem } from "@/schemas/takeoff";

export type ItemCost = { item: TakeoffItem; total: number; invested: number };

// Total and planned-to-date cost per work item (partida), largest first
export function costByItem(schedule: Schedule, week: number): ItemCost[] {
  const day = weekEndDay(week);
  const totals = new Map<TakeoffItem, ItemCost>();
  for (const task of schedule.tasks) {
    const fraction = taskFraction(task, day);
    for (const line of task.lines) {
      const cost = computeCost([line]).total;
      const current = totals.get(line.item) ?? { item: line.item, total: 0, invested: 0 };
      totals.set(line.item, { ...current, total: current.total + cost, invested: current.invested + cost * fraction });
    }
  }
  return [...totals.values()].sort((a, b) => b.total - a.total);
}

// Stores sell whole bags, bricks and kilos, and aggregates by the tenth of a cubic meter
export function purchaseQuantity(entry: WeekMaterial): number {
  const precision = entry.unit === "m3" ? 10 : 1;
  return Math.ceil(entry.quantity * precision - 1e-9) / precision;
}

export function purchaseCost(entry: WeekMaterial): number {
  return purchaseQuantity(entry) * MATERIAL_PRICES[entry.material];
}

export function shoppingListMessage(projectName: string, week: number, entries: WeekMaterial[]): string {
  const lines = entries.map(
    (entry) => `- ${purchaseQuantity(entry)} ${UNIT_LABELS[entry.unit]} ${MATERIAL_LABELS[entry.material]}: ${formatSoles(purchaseCost(entry))}`,
  );
  const total = entries.reduce((sum, entry) => sum + purchaseCost(entry), 0);
  return [`${projectName} · week ${week} shopping list`, ...lines, `Total: ${formatSoles(total)}`].join("\n");
}

export function whatsappUrl(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
