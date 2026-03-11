import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E testing configuration
 * Tests critical user flows: login → create request → approve
 */
export default defineConfig({
  testDir: "./src/test/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  timeout: process.env.CI ? 60_000 : 30_000,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    // Only run multi-browser locally — CI runs Chromium only for speed
    ...(process.env.CI
      ? []
      : [
          {
            name: "firefox",
            use: { ...devices["Desktop Firefox"] },
          },
          {
            name: "webkit",
            use: { ...devices["Desktop Safari"] },
          },
        ]),
  ],

  webServer: {
    // In CI: build then start (HTTP, no HTTPS cert needed, faster than dev recompile)
    // Locally: dev server with hot reload
    command: process.env.CI ? "npm run start:e2e" : "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: process.env.CI ? 300_000 : 120_000, // 5 min for CI build, 2 min for dev
  },
});
