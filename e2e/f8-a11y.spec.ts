import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const ROUTES = [
  { name: "home", path: "/" },
  { name: "upload wizard", path: "/subir" },
  { name: "processing without a plan", path: "/subir/procesando" },
  { name: "1-floor workspace", path: "/proyecto/casa-1-piso-90", ready: true },
  { name: "2-floor workspace", path: "/proyecto/vivienda-2-pisos-120", ready: true },
  { name: "2D editor", path: "/proyecto/casa-1-piso-90/editor" },
  { name: "log progress", path: "/proyecto/casa-1-piso-90/avance" },
  { name: "family view", path: "/compartir/casa-1-piso-90", ready: true },
  { name: "broken share link", path: "/compartir/this-link-was-mistyped" },
  { name: "missing project", path: "/proyecto/does-not-exist" },
];

async function settle(page: Page, ready?: boolean) {
  await page.waitForLoadState("networkidle");
  if (ready) await expect(page.getByTestId("viewer").filter({ visible: true })).toHaveAttribute("data-ready", "true", { timeout: 20_000 });
  await expect(page.getByTestId("page-skeleton")).toHaveCount(0);
}

for (const route of ROUTES) {
  test(`${route.name} has no serious or critical accessibility violations`, async ({ page }) => {
    await page.goto(route.path);
    await settle(page, route.ready);
    // The WebGL canvas is drawn pixels, not content, so axe cannot measure colors inside it
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).exclude("canvas").analyze();
    const blocking = results.violations.filter((violation) => violation.impact === "serious" || violation.impact === "critical");
    expect(blocking.map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(" ")).join(", ")}`)).toEqual([]);
  });
}

test("the first Tab reaches a visible skip link that jumps to the content", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);
});

test("focused controls show a visible focus ring", async ({ page }) => {
  await page.goto("/proyecto/casa-1-piso-90");
  await settle(page, true);
  for (let step = 0; step < 6; step++) {
    await page.keyboard.press("Tab");
    const ring = await page.evaluate(() => {
      const element = document.activeElement;
      if (!element || element === document.body) return "none";
      const style = getComputedStyle(element);
      return style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0 ? "outline" : style.boxShadow !== "none" ? "shadow" : "none";
    });
    expect(ring).not.toBe("none");
  }
});

test("buttons and links on phones are at least 44 px tall or wide", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Touch target size is a phone requirement");
  for (const path of ["/", "/proyecto/casa-1-piso-90", "/compartir/casa-1-piso-90", "/proyecto/casa-1-piso-90/avance"]) {
    await page.goto(path);
    await settle(page);
    const small = await page.evaluate(() =>
      [...document.querySelectorAll("main button, main a[href], header button, header a[href], nav a[href]")]
        .filter((element) => !element.closest("p, li > p, figcaption") && getComputedStyle(element).visibility !== "hidden")
        .map((element) => ({ element, box: element.getBoundingClientRect() }))
        .filter(({ box }) => box.width > 0 && box.height > 0 && (box.height < 44 && box.width < 44 || box.height < 24))
        .map(({ element, box }) => `${element.textContent?.trim() || element.getAttribute("aria-label")} ${Math.round(box.width)}×${Math.round(box.height)}`),
    );
    expect(small, path).toEqual([]);
  }
});
