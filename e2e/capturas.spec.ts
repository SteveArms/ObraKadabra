import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import analysis from "./fixtures/avance-columnas.json";
import { calibrate, fulfillPlan, ndjson, uploadPlan } from "./helpers/upload";

// High-quality screenshots of every screen with demo data, for the README and the hackathon form: pnpm capturas
const OUT = path.join(__dirname, "..", "docs", "capturas");
const DEMO = "casa-1-piso-90";
const TAG = { tag: "@capturas" };

test.use({ deviceScaleFactor: 2 });
test.describe.configure({ mode: "serial" });

async function shoot(page: Page, name: string, projectName: string, fullPage = false) {
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(OUT, `${name}-${projectName}.png`), fullPage, animations: "disabled" });
}

async function viewerReady(page: Page) {
  await expect(page.getByTestId("viewer").filter({ visible: true })).toHaveAttribute("data-ready", "true", { timeout: 30_000 });
  await page.waitForTimeout(800);
}

test("01 home", TAG, async ({ page }, info) => {
  await page.goto("/");
  await shoot(page, "01-inicio", info.project.name, true);
});

test("02 upload wizard", TAG, async ({ page }, info) => {
  await uploadPlan(page);
  await shoot(page, "02-subir-plano", info.project.name);
  await page.getByTestId("wizard-next").click();
  await calibrate(page);
  await shoot(page, "03-calibrar-escala", info.project.name);
});

test("03 AI reading the plan", TAG, async ({ page }, info) => {
  // The answer is held back so the screen shows the AI working, then the plan arrives
  await page.route("/api/plano", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 4_000));
    await route.fulfill({ status: 200, contentType: "application/x-ndjson", body: ndjson() });
  });
  await uploadPlan(page);
  await page.getByTestId("wizard-next").click();
  await calibrate(page);
  await page.getByTestId("wizard-next").click();
  await page.getByLabel("Project name").fill("Casa Quispe");
  await page.getByTestId("wizard-next").click();
  await expect(page).toHaveURL(/\/subir\/procesando$/);
  await page.waitForTimeout(1_000);
  await shoot(page, "04-ia-leyendo-plano", info.project.name);
  await expect(page).toHaveURL(/\/editor$/, { timeout: 20_000 });
  await page.waitForTimeout(800);
  await shoot(page, "05-editor-2d", info.project.name);
});

test("04 4D/5D workspace", TAG, async ({ page }, info) => {
  await page.goto(`/proyecto/${DEMO}`);
  await viewerReady(page);
  await shoot(page, "06-espacio-4d-5d", info.project.name);
  await page.getByRole("tab", { name: "Cost" }).click();
  await shoot(page, "07-costos-curva-s", info.project.name);
});

test("05 progress with photo and AI", TAG, async ({ page }, info) => {
  await page.route("**/api/avance", (route) => route.fulfill({ json: analysis }));
  await page.goto(`/proyecto/${DEMO}/avance`);
  await page.getByRole("button", { name: "First floor" }).click();
  await page.getByTestId("site-photo-input").setInputFiles(path.join(__dirname, "fixtures", "obra-columnas.jpg"));
  await expect(page.getByTestId("analysis-panel")).toHaveAttribute("data-state", "done");
  await page.waitForTimeout(600);
  await shoot(page, "08-avance-con-foto", info.project.name);
});

test("06 family view and share", TAG, async ({ page }, info) => {
  await page.goto(`/compartir/${DEMO}`);
  await viewerReady(page);
  await shoot(page, "09-vista-familiar", info.project.name, true);
  await page.goto(`/proyecto/${DEMO}`);
  await page.getByTestId("header-share").click();
  await expect(page.getByTestId("share-link")).toHaveValue(/compartir/);
  await shoot(page, "10-compartir", info.project.name);
});

test("07 walkthrough video", TAG, async ({ browser }, info) => {
  test.skip(info.project.name !== "desktop", "One video is enough for the 3-minute demo");
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: path.join(OUT, "video"), size: { width: 1440, height: 900 } }, storageState: { cookies: [], origins: [] } });
  const page = await context.newPage();
  await page.route("/api/plano", fulfillPlan);
  await page.goto("/");
  await page.waitForTimeout(1_500);
  await page.locator(`[data-testid="demo-card"][data-demo-id="${DEMO}"]`).getByTestId("demo-open").click();
  await viewerReady(page);
  const tour = page.getByTestId("workspace-tour");
  for (let step = 0; step < 3; step++) {
    await page.waitForTimeout(1_500);
    await tour.getByRole("button", { name: /Next|Got it/ }).click();
  }
  await page.getByTestId("timeline-slider").focus();
  await page.keyboard.press("Home");
  for (let week = 1; week < 10; week++) {
    await page.waitForTimeout(500);
    await page.keyboard.press("ArrowRight");
  }
  await page.getByRole("tab", { name: "Cost" }).click();
  await page.waitForTimeout(1_500);
  await page.goto(`/compartir/${DEMO}`);
  await viewerReady(page);
  await page.mouse.wheel(0, 900);
  await page.waitForTimeout(2_000);
  const video = page.video();
  await context.close();
  await video?.saveAs(path.join(OUT, "recorrido-desktop.webm"));
  await video?.delete();
});
