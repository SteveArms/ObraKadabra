import { planFileError } from "@/lib/plan";
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
