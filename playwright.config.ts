import { defineConfig } from "@playwright/test";

/**
 * C&M Barber Shop — Playwright E2E config
 * Two projects: desktop (Chromium wide) + mobile (Chromium, narrow viewport)
 * Static site served via python http.server for local CI.
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  timeout: 15_000,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:8181",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: {
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: "mobile",
      use: {
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
      },
    },
  ],
  webServer: {
    command: "python3 -m http.server 8181",
    port: 8181,
    reuseExistingServer: !process.env.CI,
  },
});
