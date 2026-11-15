import { z } from "zod";
import { ExtractedPlanSchema, type ExtractedPlan } from "@/schemas/plan-extraction";
import { EXTRACTION_JSON_SCHEMA } from "./json-schema";
import type { PlanImage, VisionModel } from "./model";
import { extractionPrompt } from "./prompts";

export class PlanExtractionError extends Error {
  constructor() {
    super("We could not read walls in this photo. Try a sharper, straight-on photo of the plan.");
    this.name = "PlanExtractionError";
  }
}

type Parsed = { ok: true; plan: ExtractedPlan } | { ok: false; feedback: string };

export function parseExtraction(raw: string): Parsed {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { ok: false, feedback: "The answer was not valid JSON." };
  }
  const result = ExtractedPlanSchema.safeParse(json);
  if (!result.success) return { ok: false, feedback: z.prettifyError(result.error) };
  if (result.data.walls.length === 0) return { ok: false, feedback: "No walls were returned; every floor plan has walls." };
  return { ok: true, plan: result.data };
}

// The model gets one retry with the validation errors as feedback; a second failure surfaces to the user
export async function extractPlan(model: VisionModel, image: PlanImage): Promise<ExtractedPlan> {
  let feedback: string | undefined;
  for (let attempt = 0; attempt < 2; attempt++) {
    const parsed = parseExtraction(await model({ prompt: extractionPrompt(feedback), image, schema: EXTRACTION_JSON_SCHEMA }));
    if (parsed.ok) return parsed.plan;
    feedback = parsed.feedback;
  }
  throw new PlanExtractionError();
}
