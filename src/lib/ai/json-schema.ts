import { z } from "zod";
import { ExtractedPlanSchema } from "@/schemas/plan-extraction";

// Generated from the Zod schema so the model and the validator can never drift apart; providers reject the $schema key
function buildSchema(): Record<string, unknown> {
  const schema: Record<string, unknown> = { ...z.toJSONSchema(ExtractedPlanSchema, { target: "draft-2020-12" }) };
  delete schema.$schema;
  return schema;
}

export const EXTRACTION_JSON_SCHEMA = buildSchema();
