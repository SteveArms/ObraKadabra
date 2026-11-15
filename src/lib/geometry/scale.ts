import type { Point } from "@/schemas/floor-plan";
import { length } from "./measure";

// Calibration: two clicked points on the image and the real distance between them give meters per pixel
export function metersPerPixel(a: Point, b: Point, meters: number): number | null {
  const pixels = length(a, b);
  if (pixels === 0 || !(meters > 0)) return null;
  return meters / pixels;
}

export function pixelsToMeters(pixels: number, scale: number): number {
  return pixels * scale;
}

export function metersToPixels(meters: number, scale: number): number {
  return meters / scale;
}
