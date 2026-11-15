import type { Wall } from "@/schemas/floor-plan";

export function makeWall(id: string, x1: number, y1: number, x2: number, y2: number, overrides: Partial<Wall> = {}): Wall {
  return { id, x1, y1, x2, y2, thickness: 0.15, kind: "load_bearing", level: 1, confidence: 1, ...overrides };
}
