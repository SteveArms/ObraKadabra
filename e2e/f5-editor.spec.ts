import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { makeFixturePlan } from "../src/lib/ai/test-fixture";
import { PROJECTS_STORAGE_KEY } from "../src/lib/projects";
import type { Project } from "../src/schemas/project";

const PROJECT_ID = "casa-de-prueba";
const EDITOR_URL = `/proyecto/${PROJECT_ID}/editor`;
const PLAN_PNG = path.join(__dirname, "fixtures", "plano-simple.png");

const PROJECT: Project = {
  id: PROJECT_ID,
  name: "Casa de prueba",
  status: "draft",
  floorPlan: makeFixturePlan(),
  createdAt: "2026-11-15T10:00:00.000Z",
  updatedAt: "2026-11-15T10:00:00.000Z",
};

// Seeds once per browser context, so a project the editor saves is not overwritten on the next page load
test.beforeEach(async ({ page }) => {
  await page.addInitScript(
    ([key, value]) => {
      if (!window.localStorage.getItem(key)) window.localStorage.setItem(key, value);
    },
    [PROJECTS_STORAGE_KEY, JSON.stringify([PROJECT])] as const,
  );
});

// The upload flow keeps the plan photo in IndexedDB; this writes the same record for plano-simple.png (1000 × 800 px)
async function seedPlanPhoto(page: Page) {
  await page.goto("/");
  const base64 = readFileSync(PLAN_PNG).toString("base64");
  await page.evaluate(
    async ({ base64, projectId }) => {
      const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open("obrakadabra", 1);
        request.onupgradeneeded = () => request.result.createObjectStore("plan-images", { keyPath: ["projectId", "level"] });
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction("plan-images", "readwrite");
        transaction.objectStore("plan-images").put({ projectId, level: 1, blob: new Blob([bytes], { type: "image/png" }), width: 1000, height: 800 });
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
      db.close();
    },
    { base64, projectId: PROJECT_ID },
  );
}

async function openEditor(page: Page) {
  await page.goto(EDITOR_URL);
  await expect(page.getByTestId("plan-editor")).toBeVisible();
}

async function reviewNext(page: Page) {
  await page.getByRole("button", { name: "Review next" }).click();
}

test("shows how many elements need confirmation", async ({ page }) => {
  await openEditor(page);
  await expect(page.getByTestId("pending-count")).toHaveText("3 elements need confirmation");
  await expect(page.getByTestId("plan-canvas")).toHaveAttribute("data-pending-count", "3");
});

test("Review next selects the first pending element and shows its properties", async ({ page }) => {
  await openEditor(page);
  await reviewNext(page);
  await expect(page.getByTestId("plan-canvas")).toHaveAttribute("data-selected-id", "M-5");
  const panel = page.getByTestId("properties-panel");
  await expect(panel).toHaveAttribute("data-element-id", "M-5");
  await expect(panel.getByTestId("selected-label")).toHaveText("Wall M-5");
  await expect(panel.getByLabel("Length")).toHaveValue("6.00");
  await expect(panel.getByTestId("wall-confinement")).toHaveText("C-2 and C-5");
  await expect(panel.getByTestId("element-cost")).toContainText("S/");
});

test("choosing Partition (15 cm) sets the thickness to 0.15 and lowers the count to 2", async ({ page }) => {
  await openEditor(page);
  await reviewNext(page);
  await page.getByTestId("decision-popover").getByRole("button", { name: "Partition (15 cm)" }).click();
  await expect(page.getByTestId("properties-panel").getByLabel("Thickness")).toHaveValue("0.15");
  await expect(page.getByTestId("pending-count")).toHaveText("2 elements need confirmation");
});

test("dragging a vertex changes the wall length and Ctrl+Z reverts it", async ({ page }) => {
  await openEditor(page);
  await reviewNext(page);
  const length = page.getByTestId("properties-panel").getByLabel("Length");
  await expect(length).toHaveValue("6.00");
  const box = await page.getByTestId("vertex-M-5-start").boundingBox();
  if (!box) throw new Error("the M-5 start vertex is not visible");
  const start = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(start.x, start.y + 60, { steps: 6 });
  await page.mouse.up();
  await expect(length).not.toHaveValue("6.00");
  await page.keyboard.press("Control+z");
  await expect(length).toHaveValue("6.00");
});

test("validating the remaining pending elements brings the count to zero", async ({ page }) => {
  await openEditor(page);
  for (const id of ["M-5", "V-2", "C-5"]) {
    await reviewNext(page);
    await expect(page.getByTestId("plan-canvas")).toHaveAttribute("data-selected-id", id);
    await page.getByRole("button", { name: `Validate ${id}` }).click();
  }
  await expect(page.getByTestId("pending-count")).toHaveText("Every element is confirmed");
  await expect(page.getByTestId("plan-canvas")).toHaveAttribute("data-pending-count", "0");
});

test("Build in 3D asks about pending elements, saves and opens the workspace with the model", async ({ page }) => {
  await openEditor(page);
  await page.getByRole("button", { name: "Looks good, build in 3D" }).click();
  const dialog = page.getByTestId("confirm-build");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Build in 3D" }).click();
  await expect(page).toHaveURL(`/proyecto/${PROJECT_ID}`);
  // The router keeps the editor mounted but hidden for the back button, so only the visible viewer counts
  await expect(page.getByTestId("plan-editor")).toBeHidden();
  const viewer = page.getByTestId("viewer").filter({ visible: true });
  await expect.poll(async () => Number(await viewer.getAttribute("data-visible-count"))).toBeGreaterThan(0);
  const saved = await page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) ?? "[]"), PROJECTS_STORAGE_KEY);
  expect(saved[0].status).toBe("ready");
  await page.goBack();
  await expect(page.getByRole("button", { name: "Looks good, build in 3D" })).toBeEnabled();
});

test("the Original, AI and Both toggle shows the photo, the drawing or both", async ({ page }) => {
  await seedPlanPhoto(page);
  await openEditor(page);
  const original = page.getByTestId("layer-original");
  const drawing = page.getByTestId("layer-ai");
  await expect(original.locator("image")).toBeVisible();
  await expect(drawing).toBeVisible();
  await page.getByTestId("layers-original").click();
  await expect(page.getByTestId("plan-canvas")).toHaveAttribute("data-layers", "original");
  await expect(drawing).toBeHidden();
  await expect(original.locator("image")).toBeVisible();
  await page.getByTestId("layers-ai").click();
  await expect(original).toBeHidden();
  await expect(drawing).toBeVisible();
  await page.getByTestId("layers-both").click();
  await expect(original.locator("image")).toBeVisible();
  await expect(drawing).toBeVisible();
});
