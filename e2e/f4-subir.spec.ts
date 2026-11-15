import path from "node:path";
import { expect, test, type Page, type Route } from "@playwright/test";
import { toLevelPlan } from "../src/lib/ai/convert";
import { pendingElements } from "../src/lib/plan";
import { ExtractedPlanSchema } from "../src/schemas/plan-extraction";
import fixture from "./fixtures/plano-simple.json";

const PLAN_PNG = path.join(__dirname, "fixtures", "plano-simple.png");
// plano-simple.png is 1000 × 800 px and its "8.00 m" dimension line runs from x = 100 to x = 900 at y = 60
const DIMENSION_ENDS = [
  { x: 0.1, y: 0.075 },
  { x: 0.9, y: 0.075 },
];

function ndjson(): string {
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

const fulfillPlan = (route: Route) => route.fulfill({ status: 200, contentType: "application/x-ndjson", body: ndjson() });

async function uploadPlan(page: Page) {
  await page.goto("/subir");
  await page.getByTestId("plan-file-input").setInputFiles(PLAN_PNG);
  await expect(page.getByTestId("plan-preview")).toBeVisible();
}

async function calibrate(page: Page) {
  const image = page.getByTestId("calibration-image");
  const box = await image.boundingBox();
  if (!box) throw new Error("calibration image is not visible");
  for (const end of DIMENSION_ENDS) await image.click({ position: { x: box.width * end.x, y: box.height * end.y } });
  await page.getByLabel("Real distance between A and B").fill("8.00");
}

async function reachProcessing(page: Page) {
  await uploadPlan(page);
  await page.getByTestId("wizard-next").click();
  await calibrate(page);
  await page.getByTestId("wizard-next").click();
  await page.getByLabel("Project name").fill("Casa de prueba");
  await page.getByTestId("wizard-next").click();
  await expect(page).toHaveURL(/\/subir\/procesando$/);
}

test("uploading the PNG shows the preview and lets you continue", async ({ page }) => {
  await page.goto("/subir");
  const wizard = page.getByTestId("upload-wizard");
  await page.getByTestId("wizard-next").click();
  await expect(page.getByTestId("wizard-error")).toContainText("Add a photo or PDF");
  await expect(wizard).toHaveAttribute("data-step", "0");
  await page.getByTestId("plan-file-input").setInputFiles(PLAN_PNG);
  await expect(page.getByTestId("plan-preview")).toBeVisible();
  await expect(page.getByRole("img", { name: "Floor 1 plan" })).toBeVisible();
  await page.getByTestId("wizard-next").click();
  await expect(wizard).toHaveAttribute("data-step", "1");
});

test("step 2 needs two points and a distance before it shows the scale", async ({ page }) => {
  await uploadPlan(page);
  await page.getByTestId("wizard-next").click();
  await page.getByTestId("wizard-next").click();
  await expect(page.getByTestId("wizard-error")).toContainText("Mark two points");
  await expect(page.getByTestId("upload-wizard")).toHaveAttribute("data-step", "1");
  await calibrate(page);
  await expect(page.getByTestId("calibration-image")).toHaveAttribute("data-points", "2");
  await expect(page.getByTestId("calibration-scale")).toContainText("1 px = 0.0100 m");
  await page.getByTestId("wizard-next").click();
  await expect(page.getByTestId("upload-wizard")).toHaveAttribute("data-step", "2");
});

test("a 2.20 m floor height shows an error and 2.60 m lets you continue", async ({ page }) => {
  await page.route("/api/plano", fulfillPlan);
  await uploadPlan(page);
  await page.getByTestId("wizard-next").click();
  await calibrate(page);
  await page.getByTestId("wizard-next").click();
  await page.getByLabel("Project name").fill("Casa de prueba");
  const height = page.getByLabel("Floor-to-floor height");
  await height.fill("2.20");
  await page.getByTestId("wizard-next").click();
  await expect(height).toHaveAttribute("aria-invalid", "true");
  await expect(height).toBeFocused();
  await expect(page.getByText("Use a floor height of at least 2.40 m.")).toBeVisible();
  await height.fill("2.60");
  await page.getByTestId("wizard-next").click();
  await expect(page).toHaveURL(/\/subir\/procesando$/);
});

test("processing ticks every step and opens the editor with a draft project", async ({ page }) => {
  await page.route("/api/plano", fulfillPlan);
  await reachProcessing(page);
  const steps = page.getByTestId("processing-step");
  await expect(steps).toHaveCount(5);
  await expect(page.locator('[data-testid="processing-step"][data-step="walls"]')).toContainText("6 walls found: 5 load-bearing and 1 partition.");
  await expect(page).toHaveURL(/\/proyecto\/[\w-]+\/editor$/);
  const id = page.url().split("/").at(-2);
  const saved = await page.evaluate((projectId) => {
    const projects: { id: string; status?: string; floorPlan: { walls: unknown[] } }[] = JSON.parse(localStorage.getItem("obrakadabra:projects") ?? "[]");
    return projects.find((project) => project.id === projectId);
  }, id);
  expect(saved?.status).toBe("draft");
  expect(saved?.floorPlan.walls).toHaveLength(6);
});

test("a 500 from the API shows the error state and Try again calls it again", async ({ page }) => {
  let calls = 0;
  await page.route("/api/plano", (route) => {
    calls += 1;
    return calls === 1 ? route.fulfill({ status: 500, body: "boom" }) : fulfillPlan(route);
  });
  await reachProcessing(page);
  await expect(page.getByTestId("processing-error")).toBeVisible();
  await expect(page.getByTestId("processing")).toHaveAttribute("data-phase", "failed");
  await expect(page.getByRole("link", { name: "Upload another photo" })).toBeVisible();
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page).toHaveURL(/\/proyecto\/[\w-]+\/editor$/);
  expect(calls).toBe(2);
});

test("the continue button stays visible on every step", async ({ page }) => {
  await uploadPlan(page);
  const next = page.getByTestId("wizard-next");
  await expect(next).toBeInViewport();
  await next.click();
  await expect(next).toBeInViewport();
  await calibrate(page);
  await next.click();
  await expect(next).toBeInViewport();
  await page.getByLabel("Floor-to-floor height").scrollIntoViewIfNeeded();
  await expect(next).toBeInViewport();
});

test("@ai the real model reads plano-simple.png", async ({ page }) => {
  test.skip(!process.env.AI_API_KEY, "Needs AI_API_KEY; never runs in CI");
  test.setTimeout(120_000);
  await reachProcessing(page);
  await expect(page).toHaveURL(/\/proyecto\/[\w-]+\/editor$/, { timeout: 90_000 });
});
