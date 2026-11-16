import { defineConfig } from "@playwright/test";

const PORT = 3100;
const isCI = Boolean(process.env.CI);
// Set by the deploy workflow to run the @smoke subset against a Vercel preview instead of a local build
const remoteBaseUrl = process.env.PLAYWRIGHT_BASE_URL;
const baseURL = remoteBaseUrl ?? `http://localhost:${PORT}`;
// Specs act as a returning user who already saw the workspace tour; f8-pulido starts from empty storage to test it
const tourSeen = { cookies: [], origins: [{ origin: new URL(baseURL).origin, localStorage: [{ name: "obrakadabra:tour-done", value: "true" }] }] };

// @ai calls the real model and costs money, so CI never runs it; @capturas rewrites docs/capturas, so it runs only when asked for
function skippedTags(): RegExp | undefined {
  const asked = process.argv.join(" ");
  const tags = [isCI ? "@ai" : "", asked.includes("@capturas") ? "" : "@capturas"].filter(Boolean);
  return tags.length ? new RegExp(tags.join("|")) : undefined;
}

export default defineConfig({
  testDir: "./e2e",
  // WebGL and fonts render differently per OS, so each platform keeps its own baseline (CI compares the linux one)
  snapshotPathTemplate: "{testDir}/__screenshots__/{testFilePath}/{arg}-{projectName}-{platform}{ext}",
  fullyParallel: true,
  forbidOnly: isCI,
  grepInvert: skippedTags(),
  retries: isCI ? 1 : 0,
  reporter: isCI ? [["html", { open: "never" }], ["github"]] : [["html", { open: "never" }], ["list"]],
  use: {
    baseURL,
    storageState: tourSeen,
    browserName: "chromium",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions: { args: ["--use-gl=swiftshader"] },
  },
  projects: [
    // The family view is opened from a phone link, so its spec runs on mobile only
    { name: "desktop", use: { viewport: { width: 1440, height: 900 } }, testIgnore: /f7-compartir/ },
    { name: "mobile", use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
  webServer: remoteBaseUrl
    ? undefined
    : {
        // Production build: no per-route dev compilation and no dev overlay over the UI
        command: `pnpm build && pnpm start --port ${PORT}`,
        url: `http://localhost:${PORT}`,
        reuseExistingServer: !isCI,
        timeout: 300_000,
        // Empty Supabase vars keep e2e on this browser's storage: no network, no anonymous users created by tests
        env: { NEXT_PUBLIC_SUPABASE_URL: "", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "", SUPABASE_SECRET_KEY: "" },
      },
});
