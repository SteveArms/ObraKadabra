import { ExtractedPlanSchema, type ExtractedPlan } from "@/schemas/plan-extraction";
import { EXTRACTION_JSON_SCHEMA } from "./json-schema";
import type { PlanImage, VisionModel } from "./model";
import { extractionPrompt } from "./prompts";
import { generateValidated, parseJsonWith, type Checked } from "./validated";

export class PlanExtractionError extends Error {
  constructor() {
    super("We could not read walls in this photo. Try a sharper, straight-on photo of the plan.");
    this.name = "PlanExtractionError";
  }
}

export function parseExtraction(raw: string): Checked<ExtractedPlan> {
  const parsed = parseJsonWith(raw, ExtractedPlanSchema);
  if (parsed.ok && parsed.value.walls.length === 0) return { ok: false, feedback: "No walls were returned; every floor plan has walls." };
  return parsed;
}

export function extractPlan(model: VisionModel, image: PlanImage): Promise<ExtractedPlan> {
  return generateValidated(model, { image, schema: EXTRACTION_JSON_SCHEMA, prompt: extractionPrompt, check: parseExtraction, failure: () => new PlanExtractionError() });
}
