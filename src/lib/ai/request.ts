import { PLAN_UPLOAD_MAX_BYTES, planFileError } from "@/lib/plan";
import { ProgressContextSchema, type ProgressContext } from "@/schemas/progress";
import type { PlanImage } from "./model";
import type { PlanJob } from "./pipeline";

export type PlanRequest = { job: PlanJob; fileName: string };
export type ParsedPlanRequest = { ok: true; request: PlanRequest } | { ok: false; message: string };

function positive(value: FormDataEntryValue | null): number | null {
  const number = typeof value === "string" ? Number(value) : Number.NaN;
  return Number.isFinite(number) && number > 0 ? number : null;
}

// multipart fields: file (the plan), scale (meters per pixel of that file) and level (1 for the ground floor)
export async function parsePlanForm(form: FormData): Promise<ParsedPlanRequest> {
  const file = form.get("file");
  if (!(file instanceof File)) return { ok: false, message: "Attach the plan photo in the file field." };
  const fileError = planFileError(file);
  if (fileError) return { ok: false, message: fileError };
  const scale = positive(form.get("scale"));
  if (!scale) return { ok: false, message: "Calibrate the scale before reading the plan." };
  const level = positive(form.get("level")) ?? 1;
  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
  return { ok: true, request: { fileName: file.name, job: { image: { mimeType: file.type, base64 }, scale, level: Math.round(level) } } };
}

const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type ProgressRequest = { image: PlanImage; context: ProgressContext; fileName: string };
export type ParsedProgressRequest = { ok: true; request: ProgressRequest } | { ok: false; message: string };

function contextFrom(value: FormDataEntryValue | null): ProgressContext | null {
  if (typeof value !== "string") return null;
  try {
    const parsed = ProgressContextSchema.safeParse(JSON.parse(value));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

// multipart fields: file (the site photo) and context (JSON: week, level, sector and the elements expected there)
export async function parseProgressForm(form: FormData): Promise<ParsedProgressRequest> {
  const file = form.get("file");
  if (!(file instanceof File)) return { ok: false, message: "Attach the site photo in the file field." };
  if (!PHOTO_TYPES.includes(file.type)) return { ok: false, message: "Upload a JPG, PNG or WebP photo." };
  if (file.size === 0 || file.size > PLAN_UPLOAD_MAX_BYTES) return { ok: false, message: "Upload a photo of 25 MB or less." };
  const context = contextFrom(form.get("context"));
  if (!context) return { ok: false, message: "Choose the floor and make sure the plan has elements scheduled for this week." };
  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
  return { ok: true, request: { fileName: file.name, image: { mimeType: file.type, base64 }, context } };
}
