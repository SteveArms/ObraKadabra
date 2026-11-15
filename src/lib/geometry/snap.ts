import type { Wall } from "@/schemas/floor-plan";
import { wallLength } from "./measure";

export function snapToGrid(value: number, step: number): number {
  if (step <= 0) return value;
  return Math.round(value / step) * step;
}

// Rotates the wall around its start point onto the nearest multiple of 90° when it is within the tolerance
export function snapAngle(wall: Wall, toleranceDeg: number): Wall {
  const angle = (Math.atan2(wall.y2 - wall.y1, wall.x2 - wall.x1) * 180) / Math.PI;
  const target = Math.round(angle / 90) * 90;
  if (Math.abs(angle - target) > toleranceDeg || angle === target) return wall;
  const radians = (target * Math.PI) / 180;
  const size = wallLength(wall);
  return {
    ...wall,
    x2: wall.x1 + Math.round(Math.cos(radians)) * size,
    y2: wall.y1 + Math.round(Math.sin(radians)) * size,
  };
}
