import { expect, test, type Page } from "@playwright/test";
import { DEMO_PROJECTS } from "../src/lib/projects";
import { scheduleFor, statusAt } from "../src/lib/schedule";

const casa = DEMO_PROJECTS.find((demo) => demo.id === "casa-1-piso-90")!;
const schedule = scheduleFor(casa.floorPlan);

async function openAtWeek(page: Page, week: number) {
  await page.goto(`/proyecto/${casa.id}`);
  const viewer = page.getByTestId("viewer");
  await expect(viewer).toHaveAttribute("data-ready", "true", { timeout: 20_000 });
  const slider = page.getByTestId("timeline-slider");
  await slider.focus();
  await page.keyboard.press("Home");
  for (let step = 1; step < week; step++) await page.keyboard.press("ArrowRight");
  await expect(viewer).toHaveAttribute("data-week", String(week));
  return { viewer, slider };
}

const visibleCount = async (page: Page) => Number(await page.getByTestId("viewer").getAttribute("data-visible-count"));

test("week 1 only shows foundation elements", async ({ page }) => {
  const { slider } = await openAtWeek(page, 1);
  await expect(slider).toHaveAttribute("aria-valuenow", "1");
  const started = Object.entries(statusAt(schedule, 1)).filter(([, status]) => status !== "not_started");
  expect(started.every(([key]) => key.startsWith("footing_"))).toBe(true);
  expect(await visibleCount(page)).toBe(started.length);
});

test("moving to week 8 with the keyboard builds more and updates cost and materials", async ({ page }) => {
  const { viewer, slider } = await openAtWeek(page, 1);
  const countWeek1 = await visibleCount(page);
  const spendWeek1 = await page.getByTestId("kpi-invested").textContent();
  await page.getByRole("tab", { name: "Materials" }).click();
  const listWeek1 = await page.getByRole("tabpanel", { name: "Materials" }).textContent();
  await slider.focus();
  for (let step = 1; step < 8; step++) await page.keyboard.press("ArrowRight");
  await expect(viewer).toHaveAttribute("data-week", "8");
  await expect(slider).toHaveAttribute("aria-valuenow", "8");
  expect(await visibleCount(page)).toBeGreaterThan(countWeek1);
  await expect(page.getByRole("tabpanel", { name: "Materials" })).not.toHaveText(listWeek1 ?? "");
  await page.getByRole("tab", { name: "Summary" }).click();
  await expect(page.getByTestId("kpi-invested")).not.toHaveText(spendWeek1 ?? "");
});

test("Simulate 4D advances the weeks and Pause stops them", async ({ page }) => {
  const { viewer } = await openAtWeek(page, 1);
  await page.getByTestId("timeline-play").click();
  await expect(viewer).not.toHaveAttribute("data-week", "1", { timeout: 5_000 });
  await page.getByTestId("timeline-play").click();
  const paused = await viewer.getAttribute("data-week");
  await page.waitForTimeout(1_500);
  await expect(viewer).toHaveAttribute("data-week", paused!);
});

test("the Cost tab shows the S-curve and the same total as the home card", async ({ page }) => {
  await page.goto("/");
  const homeBudget = await page.locator(`[data-testid="demo-card"][data-demo-id="${casa.id}"]`).getByTestId("demo-budget").textContent();
  await openAtWeek(page, 3);
  await page.getByRole("tab", { name: "Cost" }).click();
  await expect(page.getByTestId("s-curve")).toBeVisible();
  await expect(page.getByTestId("cost-total")).toHaveText(homeBudget!);
});

test("the WhatsApp link carries the week's materials", async ({ page }) => {
  await openAtWeek(page, 2);
  await page.getByRole("tab", { name: "Materials" }).click();
  const href = await page.getByTestId("materials-whatsapp").getAttribute("href");
  const message = decodeURIComponent(href!.replace("https://wa.me/?text=", ""));
  expect(message).toContain("week 2");
  expect(message).toContain("Cement");
  const items = await page.getByTestId("materials-list").getByRole("listitem").count();
  expect(message.split("\n").filter((line) => line.startsWith("- "))).toHaveLength(items);
});

test("tapping a stage segment jumps the timeline into it", async ({ page, isMobile }) => {
  const { viewer } = await openAtWeek(page, 1);
  const segment = page.locator('[data-testid="timeline-segment"][data-stage="finishes"]');
  const box = (await segment.boundingBox())!;
  const point = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  if (isMobile) await page.touchscreen.tap(point.x, point.y);
  else await page.mouse.click(point.x, point.y);
  const week = Number(await viewer.getAttribute("data-week"));
  expect(week).toBeGreaterThanOrEqual(Number(await segment.getAttribute("data-start-week")));
  expect(week).toBeLessThanOrEqual(Number(await segment.getAttribute("data-end-week")));
});

test("the viewer shows building materials and can switch to status colors", async ({ page, isMobile }) => {
  const { viewer } = await openAtWeek(page, 3);
  await expect(viewer).toHaveAttribute("data-color-mode", "material");
  if (isMobile) await page.getByTestId("legend-toggle").click();
  await expect(page.getByRole("list", { name: "Material legend" })).toContainText("Brick");
  const toggle = page.getByTestId("color-mode-toggle");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(viewer).toHaveAttribute("data-color-mode", "status");
  await expect(page.getByRole("list", { name: "Status legend" })).toContainText("Done");
});

test("the house and the simulation controls stay on screen together", async ({ page, isMobile }) => {
  await openAtWeek(page, 1);
  await page.evaluate(() => window.scrollTo(0, 0));
  const viewer = page.getByTestId("viewer");
  const player = page.getByTestId("mini-player");
  if (!isMobile) {
    await expect(viewer).toBeInViewport({ ratio: 1 });
    await expect(page.getByTestId("timeline-slider")).toBeInViewport({ ratio: 1 });
    return;
  }
  await page.getByRole("tablist", { name: "Project data" }).scrollIntoViewIfNeeded();
  await expect(page.getByRole("tablist", { name: "Project data" })).toBeInViewport();
  await expect(viewer).toBeInViewport({ ratio: 0.9 });
  await expect(player).toBeInViewport({ ratio: 1 });
});

test("the player inside the viewer plays, pauses and steps the weeks", async ({ page }) => {
  const { viewer } = await openAtWeek(page, 1);
  const player = page.getByTestId("mini-player");
  await player.getByRole("button", { name: "Next week" }).click();
  await expect(viewer).toHaveAttribute("data-week", "2");
  await expect(player).toContainText("W2");
  await player.getByRole("button", { name: "Play simulation" }).click();
  await expect(viewer).not.toHaveAttribute("data-week", "2", { timeout: 5_000 });
  await player.getByRole("button", { name: "Pause simulation" }).click();
  const paused = await viewer.getAttribute("data-week");
  await page.waitForTimeout(1_500);
  await expect(viewer).toHaveAttribute("data-week", paused!);
});
