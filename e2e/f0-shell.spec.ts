import { expect, test, type Page } from "@playwright/test";
import { DEFAULT_PROJECT_ID } from "../src/lib/constants";
import { getMainNavItems } from "../src/lib/navigation";

const NAV_ITEMS = getMainNavItems(DEFAULT_PROJECT_ID);

function visibleNav(page: Page, isMobile: boolean) {
  return page.getByTestId(isMobile ? "mobile-nav" : "desktop-nav");
}

test("home loads with the ObraKadabra header", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("banner")).toContainText("ObraKadabra");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

for (const item of NAV_ITEMS) {
  test(`nav link "${item.id}" opens ${item.href} and is marked active`, async ({ page, isMobile }) => {
    const startPath = item.href === "/" ? "/subir" : "/";
    await page.goto(startPath);
    const link = visibleNav(page, isMobile).getByTestId(`nav-link-${item.id}`);
    await link.click();
    await expect(page).toHaveURL(item.href);
    await expect(link).toHaveAttribute("aria-current", "page");
    await expect(visibleNav(page, isMobile).locator('[aria-current="page"]')).toHaveCount(1);
  });
}

test("navigation stays reachable at every viewport", async ({ page, isMobile }) => {
  await page.goto("/");
  const nav = visibleNav(page, isMobile);
  await expect(nav).toBeVisible();
  await expect(page.getByTestId(isMobile ? "desktop-nav" : "mobile-nav")).toBeHidden();
  for (const item of NAV_ITEMS) {
    await expect(nav.getByTestId(`nav-link-${item.id}`)).toBeVisible();
  }
  await expect(page.getByTestId("header-log-progress")).toHaveAccessibleName("Log progress");
  await expect(page.getByTestId("header-share")).toHaveAccessibleName("Share");
});

test("footer shows 2026 and no unverifiable claims", async ({ page }) => {
  await page.goto("/");
  const footer = page.getByRole("contentinfo");
  await expect(footer).toContainText("2026");
  await expect(footer).not.toContainText("Compliant");
  await expect(footer).not.toContainText("Validado por CAPECO");
});
