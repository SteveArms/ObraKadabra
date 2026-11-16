import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { reachProcessing, uploadPlan } from "./helpers/upload";

const DEMO = "/proyecto/casa-1-piso-90";
const BLURRY_PNG = path.join(__dirname, "fixtures", "plano-borroso.png");

test.describe("first visit", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("the workspace tour walks three steps, can be skipped and is remembered", async ({ page }) => {
    await page.goto(DEMO);
    const tour = page.getByTestId("workspace-tour");
    await expect(tour).toContainText("Step 1 of 3");
    await expect(tour.getByRole("heading", { name: "Travel through the weeks" })).toBeVisible();
    await tour.getByRole("button", { name: "Next" }).click();
    await expect(tour).toHaveAttribute("data-step", "2");
    await tour.getByRole("button", { name: "Skip" }).click();
    await expect(tour).toHaveCount(0);
    await page.reload();
    await expect(page.getByTestId("viewer").filter({ visible: true })).toHaveAttribute("data-ready", "true", { timeout: 20_000 });
    await expect(page.getByTestId("workspace-tour")).toHaveCount(0);
  });
});

test("Download PDF saves the project summary and the week's materials", async ({ page }) => {
  await page.goto(DEMO);
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByTestId("download-report").click()]);
  expect(download.suggestedFilename()).toMatch(/^obrakadabra-1-floor-house-90-m-week-\d+\.pdf$/);
  const file = fs.readFileSync(await download.path());
  expect(file.subarray(0, 5).toString()).toBe("%PDF-");
  expect(file.length).toBeGreaterThan(2_000);
});

test("when the AI is down the processing screen offers the demo", async ({ page }) => {
  await page.route("/api/plano", (route) => route.fulfill({ status: 503, json: { error: "The AI service is not available right now." } }));
  await reachProcessing(page);
  const failure = page.getByTestId("processing-error");
  await expect(failure).toHaveAttribute("data-kind", "service");
  await expect(failure).toContainText("The AI service is not available right now.");
  await failure.getByTestId("failure-demo").click();
  await expect(page).toHaveURL(DEMO);
});

test("a photo the AI cannot read asks for a new photo instead of the demo", async ({ page }) => {
  await page.route("/api/avance", (route) => route.fulfill({ status: 422, json: { error: "The photo is too dark to compare." } }));
  await page.goto(`${DEMO}/avance`);
  await page.getByRole("button", { name: "First floor" }).click();
  await page.getByTestId("site-photo-input").setInputFiles(path.join(__dirname, "fixtures", "obra-columnas.jpg"));
  const failure = page.getByTestId("analysis-error");
  await expect(failure).toHaveAttribute("data-kind", "request");
  await expect(failure.getByTestId("failure-demo")).toHaveCount(0);
});

test("going offline shows a banner and coming back hides it", async ({ page, context }) => {
  await page.goto(DEMO);
  await context.setOffline(true);
  await expect(page.getByTestId("offline-banner")).toBeVisible();
  await context.setOffline(false);
  await expect(page.getByTestId("offline-banner")).toHaveCount(0);
});

test("a blurry plan photo gets a warning and a sharp one does not", async ({ page }) => {
  await uploadPlan(page, BLURRY_PNG);
  await expect(page.getByTestId("blurry-warning")).toBeVisible();
  await uploadPlan(page);
  await expect(page.getByText("Plan ready for calibration.")).toBeVisible();
  await expect(page.getByTestId("blurry-warning")).toHaveCount(0);
});

test("a project that does not exist offers home and a demo", async ({ page }) => {
  await page.goto("/proyecto/does-not-exist");
  const missing = page.getByTestId("project-missing");
  await expect(missing.getByRole("heading")).toHaveText("Project not found");
  await expect(missing.getByRole("link", { name: "Open a demo" })).toHaveAttribute("href", DEMO);
});
