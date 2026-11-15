import { expect, test } from "@playwright/test";
import { formatSoles } from "../src/lib/format";
import { DEMO_PROJECTS, PROJECTS_STORAGE_KEY } from "../src/lib/projects";
import { summarizeTakeoff } from "../src/lib/takeoff";

const SEEDED_PROJECT = {
  ...DEMO_PROJECTS[0],
  id: "mi-casa-sjl",
  name: "Quispe family home",
  location: "San Juan de Lurigancho",
};

test("shows both demo cards with area, floors and budget", async ({ page }) => {
  await page.goto("/");
  const cards = page.getByTestId("demo-card");
  await expect(cards).toHaveCount(2);
  for (const card of await cards.all()) {
    await expect(card.getByTestId("demo-area")).toContainText("m²");
    await expect(card.getByTestId("demo-levels")).toContainText(/floors?/);
    await expect(card.getByTestId("demo-budget")).toContainText("S/");
  }
});

test("each demo budget matches the takeoff calculation", async ({ page }) => {
  await page.goto("/");
  for (const demo of DEMO_PROJECTS) {
    const total = summarizeTakeoff(demo.floorPlan).cost.total;
    const card = page.locator(`[data-testid="demo-card"][data-demo-id="${demo.id}"]`);
    await expect(card).toHaveAttribute("data-total", String(Math.round(total)));
    await expect(card.getByTestId("demo-budget")).toHaveText(formatSoles(total));
  }
});

test("Open 3D demo goes to the demo workspace", async ({ page }) => {
  await page.goto("/");
  await page.locator('[data-testid="demo-card"][data-demo-id="casa-1-piso-90"]').getByTestId("demo-open").click();
  await expect(page).toHaveURL("/proyecto/casa-1-piso-90");
});

test("Upload my plan goes to the upload wizard", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("hero-upload").click();
  await expect(page).toHaveURL("/subir");
});

test("shows the empty state when there are no projects", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("projects-empty")).toBeVisible();
  await expect(page.getByTestId("project-card")).toHaveCount(0);
});

test("shows a project saved in localStorage", async ({ page }) => {
  await page.addInitScript(
    ([key, value]) => window.localStorage.setItem(key, value),
    [PROJECTS_STORAGE_KEY, JSON.stringify([SEEDED_PROJECT])] as const,
  );
  await page.goto("/");
  const card = page.getByTestId("project-card");
  await expect(card).toHaveCount(1);
  await expect(card).toContainText("Quispe family home");
  await expect(page.getByTestId("projects-empty")).toHaveCount(0);
  await expect(page.getByTestId("portfolio-kpis")).toContainText("1 project");
});

test("demo cards stack on mobile and sit side by side on desktop", async ({ page, isMobile }) => {
  await page.goto("/");
  const [first, second] = await page.getByTestId("demo-card").all();
  const a = await first.boundingBox();
  const b = await second.boundingBox();
  expect(a && b).toBeTruthy();
  if (isMobile) expect(b!.y).toBeGreaterThanOrEqual(a!.y + a!.height);
  else expect(b!.y).toBeCloseTo(a!.y, 0);
  await expect(page.getByTestId("hero-upload")).toBeInViewport();
  await second.getByTestId("demo-open").scrollIntoViewIfNeeded();
  await expect(second.getByTestId("demo-open")).toBeVisible();
});

test("How it works opens a dialog that closes again", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "See how it works" }).click();
  const dialog = page.getByTestId("how-it-works-dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Close" }).click();
  await expect(dialog).toBeHidden();
});
