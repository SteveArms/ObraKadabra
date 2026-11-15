import fixture from "../../../e2e/fixtures/plano-simple.json";
import type { PlanImage } from "./model";

export const FIXTURE_JSON = JSON.stringify(fixture);
export const TEST_IMAGE: PlanImage = { mimeType: "image/png", base64: "AAAA" };
