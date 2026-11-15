import { ProgressAnalysisSchema, type ProgressAnalysis, type ProgressContext } from "@/schemas/progress";
import { PROGRESS_JSON_SCHEMA } from "./json-schema";
import type { PlanImage, VisionModel } from "./model";
import { progressPrompt } from "./prompts";
import { generateValidated, parseJsonWith, type Checked } from "./validated";

export class ProgressAnalysisError extends Error {
  constructor() {
    super("We could not match this photo to the elements planned for this week. Try a wider photo of the area you are building.");
    this.name = "ProgressAnalysisError";
  }
}

// Findings must name elements from the expected list, with their type, so they can be painted on the model
export function parseProgress(raw: string, context: ProgressContext): Checked<ProgressAnalysis> {
  const parsed = parseJsonWith(raw, ProgressAnalysisSchema);
  if (!parsed.ok) return parsed;
  const known = new Map(context.expected.map((element) => [element.id, element.type]));
  const unknown = parsed.value.findings.filter((finding) => known.get(finding.elementId) !== finding.type);
  if (unknown.length > 0) return { ok: false, feedback: `These elements are not in the expected list with that type: ${unknown.map((finding) => finding.elementId).join(", ")}.` };
  if (parsed.value.findings.length === 0) return { ok: false, feedback: "No findings were returned; report at least the elements you can see." };
  return parsed;
}

export function analyzeProgress(model: VisionModel, image: PlanImage, context: ProgressContext): Promise<ProgressAnalysis> {
  return generateValidated(model, {
    image,
    schema: PROGRESS_JSON_SCHEMA,
    prompt: (feedback) => progressPrompt(context, feedback),
    check: (raw) => parseProgress(raw, context),
    failure: () => new ProgressAnalysisError(),
  });
}
