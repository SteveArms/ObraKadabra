import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import analysis from "./fixtures/avance-columnas.json";

const PROJECT_ID = "casa-1-piso-90";
const PHOTO = path.join(__dirname, "fixtures", "obra-columnas.jpg");

// The AI is always mocked here; the request body is kept so tests can check what the photo was compared with
async function mockAnalysis(page: Page) {
  const bodies: string[] = [];
  await page.route("**/api/avance", async (route) => {
    bodies.push(route.request().postData() ?? "");
    await route.fulfill({ json: analysis });
  });
  return bodies;
}

async function analyzeFirstFloor(page: Page) {
  const bodies = await mockAnalysis(page);
  await page.goto(`/proyecto/${PROJECT_ID}/avance`);
  await page.getByRole("button", { name: "First floor" }).click();
  await page.getByTestId("site-photo-input").setInputFiles(PHOTO);
  await expect(page.getByTestId("analysis-panel")).toHaveAttribute("data-state", "done");
  return bodies;
}

test("the camera button is on screen without scrolling", async ({ page }) => {
  await page.goto(`/proyecto/${PROJECT_ID}/avance`);
  await expect(page.getByText("Upload or take a site photo")).toBeInViewport();
});

test("a first-floor photo shows two finished findings and one in progress", async ({ page }) => {
  const bodies = await analyzeFirstFloor(page);
  expect(bodies[0]).toContain('"id":"C-1"');
  expect(bodies[0]).toContain("First floor");
  const panel = page.getByTestId("analysis-panel");
  await expect(panel.locator('[data-status="done"]')).toHaveCount(2);
  await expect(panel.locator('[data-status="in_progress"]')).toHaveCount(1);
  await expect(page.getByTestId("finding-M-3")).toContainText("in progress (50%)");
  await expect(page.getByTestId("site-photo-preview")).toBeVisible();
  await expect(page.getByTestId("history-entry").first()).toContainText("Pending confirmation");
});

test("Fix details manually lets M-3 become not started", async ({ page }) => {
  await analyzeFirstFloor(page);
  await page.getByRole("button", { name: "Fix details manually" }).click();
  await page.getByLabel("Status of M-3").selectOption("not_started");
  await expect(page.getByTestId("finding-M-3")).toHaveAttribute("data-status", "not_started");
  await expect(page.getByTestId("finding-M-3")).toContainText("not started");
});

test("confirming paints C-1 as done in the 4D workspace and keeps the log in the history", async ({ page }) => {
  await analyzeFirstFloor(page);
  await page.getByRole("button", { name: "Confirm and update 3D model" }).click();
  await expect(page).toHaveURL(`/proyecto/${PROJECT_ID}`);
  const viewer = page.getByTestId("viewer").filter({ visible: true });
  await expect(viewer).toHaveAttribute("data-ready", "true", { timeout: 20_000 });
  await expect(page.getByTestId("element-option-C-1")).toHaveAttribute("data-status", "done");
  await expect(page.getByTestId("element-option-M-3")).toHaveAttribute("data-status", /in_progress|delayed/);
  await page.getByLabel("Select element").filter({ visible: true }).selectOption("column_C-1");
  await expect(page.getByTestId("element-popover")).toContainText("Done");
  await page.goto(`/proyecto/${PROJECT_ID}/avance`);
  const latest = page.getByTestId("history-entry").first();
  await expect(latest).toHaveAttribute("data-approved", "true");
  await expect(latest).toContainText("Approved");
  await expect(latest).toContainText("C-1 done");
});
