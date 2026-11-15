import type { PendingElement } from "@/schemas/plan-extraction";

export type ElementRef = Pick<PendingElement, "type" | "id">;

export type Tool = "select" | "vertex" | "wall" | "column" | "door" | "window" | "room" | "measure" | "delete" | "calibrate";

export type LayerMode = "original" | "ai" | "both";

export type Bounds = { x: number; y: number; w: number; h: number };
