import { defineConfig } from "@playwright/test";

const PORT = 3100;
const isCI = Boolean(process.env.CI);
// Set by the deploy workflow to run the @smoke subset against a Vercel preview instead of a local build
const remoteBaseUrl = process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: "./e2e",
  // WebGL and fonts render differently per OS, so each platform keeps its own baseline (CI compares the linux one)
  snapshotPathTemplate: "{testDir}/__screenshots__/{testFilePath}/{arg}-{projectName}-{platform}{ext}",
  fullyParallel: true,
  forbidOnly: isCI,
  // Specs tagged @ai call the real model and cost money, so CI never runs them
  grepInvert: isCI ? /@ai/ : undefined,
  retries: isCI ? 1 : 0,
  reporter: isCI ? [["html", { open: "never" }], ["github"]] : [["html", { open: "never" }], ["list"]],
  use: {
    baseURL: remoteBaseUrl ?? `http://localhost:${PORT}`,
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
