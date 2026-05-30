/**
 * Visual regression config — local seeding via `next dev` (no production build).
 *
 *   pnpm test:visual:update
 *
 * CI uses playwright.config.cjs + `next start` after `pnpm --filter @afenda/erp build`.
 */
const path = require("node:path");
const { defineConfig, devices } = require("@playwright/test");

const repoRoot = path.join(__dirname, "../..");
const visualPort = process.env.PLAYWRIGHT_PORT ?? "3100";
const baseURL = `http://localhost:${visualPort}`;

module.exports = defineConfig({
  testDir: "./tests/e2e",
  outputDir: path.join(repoRoot, ".artifacts/playwright/test-results"),
  testMatch: "**/ui-primitives-visual.spec.ts",
  fullyParallel: false,
  workers: 1,
  timeout: 300_000,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  snapshotPathTemplate:
    "{testDir}/{testFileDir}/{testFileName}-snapshots/{arg}{ext}",
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02,
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: `pnpm exec next dev --port ${visualPort}`,
        cwd: ".",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 300_000,
        env: {
          PORT: visualPort,
          NODE_ENV: "development",
          AFENDA_NEON_AUTH_ENABLED: "0",
          NEXT_PUBLIC_AFENDA_NEON_AUTH_ENABLED: "0",
          NEON_AUTH_BASE_URL: "",
          NEON_AUTH_COOKIE_SECRET: "",
          NEXT_PUBLIC_APP_NAME: "Afenda ERP",
          NEXT_PUBLIC_SITE_URL: baseURL,
          NEXT_PUBLIC_STAGE: "local",
        },
      },
});
