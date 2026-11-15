import { expect, test, type Page } from "@playwright/test";
import { DEMO_PROJECTS } from "../src/lib/projects";
import { scheduleFor } from "../src/lib/schedule";

async function openWorkspace(page: Page, id: string) {
  await page.goto(`/proyecto/${id}`);
  const viewer = page.getByTestId("viewer");
  await expect(viewer).toHaveAttribute("data-ready", "true", { timeout: 20_000 });
  return viewer;
}

async function visibleCount(page: Page) {
  return Number(await page.getByTestId("viewer").getAttribute("data-visible-count"));
}

test("the 1-floor demo loads its model", async ({ page }) => {
  await openWorkspace(page, "casa-1-piso-90");
  expect(await visibleCount(page)).toBeGreaterThan(0);
});

test("Top sets the top view", async ({ page }) => {
  const viewer = await openWorkspace(page, "casa-1-piso-90");
  await page.getByRole("button", { name: "Top", exact: true }).click();
  await expect(viewer).toHaveAttribute("data-view", "top");
});

test("the Floor 1 cut hides the second floor of the 2-floor demo", async ({ page }) => {
  const viewer = await openWorkspace(page, "vivienda-2-pisos-120");
  await expect(viewer).toHaveAttribute("data-level-cut", "2");
  const before = await visibleCount(page);
  await page.getByRole("button", { name: "Floor 1", exact: true }).click();
  await expect(viewer).toHaveAttribute("data-level-cut", "1");
  expect(await visibleCount(page)).toBeLessThan(before);
});

test("picking C-1 selects it and Escape closes the details", async ({ page }) => {
  const viewer = await openWorkspace(page, "vivienda-2-pisos-120");
  await page.getByLabel("Select element").selectOption("column_C-1");
  await expect(viewer).toHaveAttribute("data-selected-id", "C-1");
  const popover = page.getByTestId("element-popover");
  await expect(popover).toContainText("Column");
  await expect(popover).toContainText("S/");
  await page.keyboard.press("Escape");
  await expect(popover).toHaveCount(0);
  await expect(viewer).toHaveAttribute("data-selected-id", "");
});

test("the close button also dismisses the details", async ({ page }) => {
  await openWorkspace(page, "casa-1-piso-90");
  await page.getByLabel("Select element").selectOption("wall_M-1");
  await page.getByRole("button", { name: "Close details" }).click();
  await expect(page.getByTestId("element-popover")).toHaveCount(0);
});

test("the panel tabs sit beside the viewer on desktop and below it on mobile", async ({ page, isMobile }) => {
  await openWorkspace(page, "casa-1-piso-90");
  const viewer = (await page.getByTestId("viewer").boundingBox())!;
  const tabs = (await page.getByRole("tablist", { name: "Project data" }).boundingBox())!;
  if (isMobile) expect(tabs.y).toBeGreaterThanOrEqual(viewer.y + viewer.height);
  else expect(tabs.x).toBeGreaterThanOrEqual(viewer.x + viewer.width);
  expect(viewer.y).toBeLessThan(tabs.y + (isMobile ? 0 : 1));
  await expect(page.getByTestId("timeline")).toBeAttached();
});

test("the viewer matches its reference image", async ({ page }) => {
  const viewer = await openWorkspace(page, "casa-1-piso-90");
  // The workspace opens on today's week, so pin the last week to keep the reference image stable over time
  await page.getByTestId("timeline-slider").focus();
  await page.keyboard.press("End");
  await expect(viewer).toHaveAttribute("data-week", String(scheduleFor(DEMO_PROJECTS[0].floorPlan).totalWeeks));
  const overlays = [page.getByRole("toolbar"), page.getByRole("list", { name: "Status legend" }), page.getByTestId("viewer-coordinates")];
  await expect(viewer).toHaveScreenshot("viewer-casa-1-piso-90.png", { mask: overlays, maxDiffPixelRatio: 0.03 });
});
