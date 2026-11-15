import type { FloorPlan } from "@/schemas/floor-plan";
import type { PendingElement } from "@/schemas/plan-extraction";
import type { ElementRef } from "./types";

const TYPE_LABELS: Record<ElementRef["type"], string> = { wall: "Wall", opening: "Opening", column: "Column", room: "Room" };

export const TYPE_ICONS: Record<ElementRef["type"], string> = { wall: "view_column", opening: "door_front", column: "crop_square", room: "pentagon" };

// What the user is asked to check for each kind of element the AI was unsure about
export const REVIEW_HINTS: Record<PendingElement["type"], string> = { wall: "Load-bearing or partition", opening: "Door or window", column: "Is it a column", room: "Outline" };

// Openings read as Door or Window, the word the user sees on the plan
export function elementLabel(plan: FloorPlan, ref: ElementRef): string {
  if (ref.type !== "opening") return `${TYPE_LABELS[ref.type]} ${ref.id}`;
  const kind = plan.openings.find((opening) => opening.id === ref.id)?.kind;
  return `${kind === "window" ? "Window" : kind === "door" ? "Door" : "Opening"} ${ref.id}`;
}

export function confidenceLabel(confidence: number): string {
  return `AI confidence: ${Math.round(confidence * 100)}%`;
}
