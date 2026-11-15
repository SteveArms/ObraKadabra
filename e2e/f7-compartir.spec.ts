import { expect, test, type Page } from "@playwright/test";

const DEMO_ID = "casa-1-piso-90";

async function readyViewer(page: Page) {
  const viewer = page.getByTestId("viewer").filter({ visible: true });
  await expect(viewer).toHaveAttribute("data-ready", "true", { timeout: 20_000 });
  return viewer;
}

test("the share link opens in a new browser without a session and shows the home and its progress", async ({ page, browser }, testInfo) => {
  await page.goto(`/proyecto/${DEMO_ID}`);
  await page.getByTestId("header-share").click();
  const dialog = page.getByTestId("share-dialog");
  await expect(dialog.getByRole("button", { name: "Copy link" })).toBeVisible();
  await expect(dialog.getByRole("link", { name: "Share on WhatsApp" })).toHaveAttribute("href", /^https:\/\/wa\.me\/\?text=/);
  const link = await dialog.getByTestId("share-link").inputValue();
  expect(link).toContain(`/compartir/${DEMO_ID}`);

  const { viewport, isMobile, hasTouch } = testInfo.project.use;
  const visitor = await browser.newContext({ viewport, isMobile, hasTouch });
  const shared = await visitor.newPage();
  await shared.goto(link);
  await expect(shared.getByRole("heading", { level: 1, name: "Our future home" })).toBeVisible();
  await expect(shared.getByTestId("shared-progress")).toHaveText(/^\d{1,3}%$/);
  await expect(shared.getByTestId("card-celebration")).toBeVisible();
  await visitor.close();
});

test("the family view has no editing tools and no Log progress action", async ({ page }) => {
  await page.goto(`/compartir/${DEMO_ID}`);
  await expect(page.getByTestId("shared-view")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Main" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /log progress|edit plan|2d editor/i })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /log progress|edit|share/i })).toHaveCount(0);
  await expect(page.getByRole("toolbar")).toHaveCount(0);
});

test("the timeline slider moves the read-only 3D home through the weeks", async ({ page }) => {
  await page.goto(`/compartir/${DEMO_ID}`);
  const viewer = await readyViewer(page);
  const slider = page.getByTestId("timeline-slider");
  await slider.focus();
  await page.keyboard.press("Home");
  await expect(viewer).toHaveAttribute("data-week", "1");
  const firstWeek = Number(await viewer.getAttribute("data-visible-count"));
  await page.keyboard.press("End");
  await expect(viewer).toHaveAttribute("data-week", (await slider.getAttribute("aria-valuemax")) ?? "");
  expect(Number(await viewer.getAttribute("data-visible-count"))).toBeGreaterThan(firstWeek);
});

test("a link that does not exist shows a friendly page", async ({ page }) => {
  await page.goto("/compartir/this-link-was-mistyped");
  await expect(page.getByTestId("shared-not-found")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("This link doesn’t open a home");
  await expect(page.getByRole("link", { name: "See a sample home" })).toHaveAttribute("href", `/compartir/${DEMO_ID}`);
});

test("smoke: open the home, open a demo and move the slider", { tag: "@smoke" }, async ({ page }) => {
  await page.goto("/");
  await page.locator(`[data-testid="demo-card"][data-demo-id="${DEMO_ID}"]`).getByTestId("demo-open").click();
  await expect(page).toHaveURL(`/proyecto/${DEMO_ID}`);
  const viewer = await readyViewer(page);
  await page.getByTestId("timeline-slider").focus();
  await page.keyboard.press("Home");
  await expect(viewer).toHaveAttribute("data-week", "1");
  await page.keyboard.press("ArrowRight");
  await expect(viewer).toHaveAttribute("data-week", "2");
});
