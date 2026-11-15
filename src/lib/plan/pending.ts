import { PENDING_CONFIDENCE } from "@/lib/constants";
import type { FloorPlan } from "@/schemas/floor-plan";
import type { PendingElement } from "@/schemas/plan-extraction";

type Scored = { id: string; confidence?: number };

function below(type: PendingElement["type"], items: Scored[], threshold: number): PendingElement[] {
  return items.flatMap((item) =>
    item.confidence !== undefined && item.confidence < threshold ? [{ type, id: item.id, confidence: item.confidence }] : [],
  );
}

// Elements the AI was unsure about, least confident first so review starts with the riskiest
export function pendingElements(plan: Pick<FloorPlan, "walls" | "openings" | "columns" | "rooms">, threshold = PENDING_CONFIDENCE): PendingElement[] {
  return [
    ...below("wall", plan.walls, threshold),
    ...below("opening", plan.openings, threshold),
    ...below("column", plan.columns, threshold),
    ...below("room", plan.rooms, threshold),
  ].sort((a, b) => a.confidence - b.confidence);
}
