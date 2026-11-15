export const PLAN_UPLOAD_TYPES = ["image/jpeg", "image/png", "application/pdf"] as const;
export const PLAN_UPLOAD_MAX_BYTES = 25 * 1024 * 1024;

export type PlanFileInfo = { type: string; size: number };

// Returns the reason a file cannot be used as a plan, or null when it is fine
export function planFileError(file: PlanFileInfo): string | null {
  if (!PLAN_UPLOAD_TYPES.some((type) => type === file.type)) return "Upload a JPG, PNG or PDF file.";
  if (file.size === 0) return "This file is empty. Choose another photo of the plan.";
  if (file.size > PLAN_UPLOAD_MAX_BYTES) return "Upload a file of 25 MB or less.";
  return null;
}
