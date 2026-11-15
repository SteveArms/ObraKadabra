import { z } from "zod";
import { ExtractedPlanSchema } from "@/schemas/plan-extraction";
import { ProgressAnalysisSchema } from "@/schemas/progress";

// Generated from the Zod schemas so the model and the validator can never drift apart; providers reject the $schema key
function toModelSchema(schema: z.ZodType): Record<string, unknown> {
  const json: Record<string, unknown> = { ...z.toJSONSchema(schema, { target: "draft-2020-12" }) };
  delete json.$schema;
  return json;
}

export const EXTRACTION_JSON_SCHEMA = toModelSchema(ExtractedPlanSchema);
export const PROGRESS_JSON_SCHEMA = toModelSchema(ProgressAnalysisSchema);
