import fixture from "../../../e2e/fixtures/plano-simple.json";
import { ExtractedPlanSchema } from "@/schemas/plan-extraction";
import { assemblePlan } from "@/lib/plan";
import { toLevelPlan } from "./convert";
import type { PlanImage } from "./model";

export const FIXTURE_JSON = JSON.stringify(fixture);
export const TEST_IMAGE: PlanImage = { mimeType: "image/png", base64: "AAAA" };

// plano-simple.json calibrated at 1 px = 0.01 m: an 8 × 6 m house with M-5, V-2 and C-5 pending review
export function makeFixturePlan() {
  return assemblePlan([toLevelPlan(ExtractedPlanSchema.parse(fixture), 0.01, 1)], { name: "Casa de prueba", levels: 1, floorHeight: 2.6, roofType: "concrete_slab", calibratedMeters: 8 });
}
