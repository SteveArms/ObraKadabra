import { MIN_FLOOR_HEIGHT } from "@/data/structure";
import { parseMeters } from "@/lib/format";
import { metersPerPixel } from "@/lib/geometry";
import type { FloorPlan, Point } from "@/schemas/floor-plan";
import type { Project } from "@/schemas/project";
import type { Rect, Sheet, WizardDetails } from "./types";

export function sheetScale(sheet: Sheet): number | null {
  const [a, b] = sheet.calibration.points;
  const meters = parseMeters(sheet.calibration.meters);
  if (!a || !b || meters === null) return null;
  return metersPerPixel(a, b, meters);
}

export function rectFromPoints(a: Point, b: Point): Rect {
  return { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), width: Math.abs(b.x - a.x), height: Math.abs(b.y - a.y) };
}

// Where a crop rectangle lands after the image under it turns 90° clockwise (width and height are before turning)
export function rotateRect(rect: Rect, height: number): Rect {
  return { x: height - (rect.y + rect.height), y: rect.x, width: rect.height, height: rect.width };
}

export function uploadError(sheets: Sheet[]): string | null {
  return sheets.length === 0 ? "Add a photo or PDF of your floor plan to continue." : null;
}

export function calibrationError(sheets: Sheet[]): { sheetId: string; message: string } | null {
  for (const [index, sheet] of sheets.entries()) {
    if (sheet.calibration.points.length < 2) return { sheetId: sheet.id, message: `Mark two points on the floor ${index + 1} plan.` };
    if (sheetScale(sheet) === null) return { sheetId: sheet.id, message: `Enter the real distance between the two points on floor ${index + 1}, in meters.` };
  }
  return null;
}

export type DetailsErrors = Partial<Record<"name" | "floorHeight" | "levels", string>>;

export function detailsErrors(details: WizardDetails, sheetCount: number): DetailsErrors {
  const errors: DetailsErrors = {};
  if (!details.name.trim()) errors.name = "Enter a name for the project.";
  const height = parseMeters(details.floorHeight);
  if (height === null || height < MIN_FLOOR_HEIGHT) errors.floorHeight = `Use a floor height of at least ${MIN_FLOOR_HEIGHT.toFixed(2)} m.`;
  if (details.levels < sheetCount) errors.levels = `You uploaded plans for ${sheetCount} floors. Choose at least ${sheetCount} floors.`;
  return errors;
}

export function createDraftProject(id: string, now: Date, floorPlan: FloorPlan): Project {
  const timestamp = now.toISOString();
  return { id, name: floorPlan.meta.name, status: "draft", floorPlan, createdAt: timestamp, updatedAt: timestamp };
}
