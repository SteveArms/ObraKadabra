import path from "node:path";
import { expect, type Page, type Route } from "@playwright/test";
import { toLevelPlan } from "../../src/lib/ai/convert";
import { pendingElements } from "../../src/lib/plan";
import { ExtractedPlanSchema } from "../../src/schemas/plan-extraction";
import fixture from "../fixtures/plano-simple.json";

export const PLAN_PNG = path.join(__dirname, "..", "fixtures", "plano-simple.png");
// plano-simple.png is 1000 × 800 px and its "8.00 m" dimension line runs from x = 100 to x = 900 at y = 60
export const DIMENSION_ENDS = [
  { x: 0.1, y: 0.075 },
  { x: 0.9, y: 0.075 },
];

export function ndjson(): string {
  const plan = toLevelPlan(ExtractedPlanSchema.parse(fixture), 0.01, 1);
  const events = [
    { type: "step", step: "reading", counts: { dimensions: 2 } },
    { type: "step", step: "walls", counts: { total: 6, loadBearing: 5, partition: 1 } },
    { type: "step", step: "openings", counts: { doors: 3, windows: 2 } },
    { type: "step", step: "rooms", counts: { total: 3 }, names: plan.rooms.map((room) => room.name) },
    { type: "result", plan, pending: pendingElements(plan) },
  ];
  return events.map((event) => JSON.stringify(event)).join("\n") + "\n";
}

export const fulfillPlan = (route: Route) => route.fulfill({ status: 200, contentType: "application/x-ndjson", body: ndjson() });

export async function uploadPlan(page: Page, file = PLAN_PNG) {
  await page.goto("/subir");
  await page.getByTestId("plan-file-input").setInputFiles(file);
  await expect(page.getByTestId("plan-preview")).toBeVisible();
}

export async function calibrate(page: Page) {
  const image = page.getByTestId("calibration-image");
  const box = await image.boundingBox();
  if (!box) throw new Error("calibration image is not visible");
  for (const end of DIMENSION_ENDS) await image.click({ position: { x: box.width * end.x, y: box.height * end.y } });
  await page.getByLabel("Real distance between A and B").fill("8.00");
}

export async function reachProcessing(page: Page) {
  await uploadPlan(page);
  await page.getByTestId("wizard-next").click();
  await calibrate(page);
  await page.getByTestId("wizard-next").click();
  await page.getByLabel("Project name").fill("Casa de prueba");
  await page.getByTestId("wizard-next").click();
  await expect(page).toHaveURL(/\/subir\/procesando$/);
}
