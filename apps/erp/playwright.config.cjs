const path = require("node:path");
const { defineConfig, devices } = require("@playwright/test");

const PLAYWRIGHT_JUNIT_PATH = ".artifacts/playwright/junit.xml";
const PLAYWRIGHT_TEST_RESULTS_DIR = ".artifacts/playwright/test-results";

const repoRoot = path.join(__dirname, "../..");
const isCi = Boolean(process.env.CI);

const e2ePort = process.env.PLAYWRIGHT_PORT ?? "3100";
const baseURL =
  process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${e2ePort}`;
const neonAuthEnabled = process.env.AFENDA_NEON_AUTH_ENABLED === "1";

function createE2eServerEnv() {
  return {
    PORT: e2ePort,
    NODE_ENV: "production",
    AFENDA_DEV_AUTH_BYPASS: "0",
    AFENDA_NEON_AUTH_ENABLED: neonAuthEnabled ? "1" : "0",
    NEXT_PUBLIC_AFENDA_NEON_AUTH_ENABLED: neonAuthEnabled ? "1" : "0",
    AFENDA_E2E_DEV_AUTH: neonAuthEnabled ? "0" : "1",
    NEXT_PUBLIC_APP_NAME: "Afenda ERP",
    NEXT_PUBLIC_SITE_URL: `http://localhost:${e2ePort}`,
    NEXT_PUBLIC_STAGE: "ci",
    NEON_AUTH_BASE_URL: process.env.NEON_AUTH_BASE_URL ?? "",
    NEON_AUTH_COOKIE_SECRET: process.env.NEON_AUTH_COOKIE_SECRET ?? "",
  };
}

module.exports = defineConfig({
  testDir: "./tests/e2e",
  outputDir: path.join(repoRoot, PLAYWRIGHT_TEST_RESULTS_DIR),
  fullyParallel: true,
  forbidOnly: isCi,
  retries: isCi ? 2 : 0,
  workers: isCi ? 1 : undefined,
  reporter: isCi
    ? [
        ["list"],
        ["junit", { outputFile: path.join(repoRoot, PLAYWRIGHT_JUNIT_PATH) }],
      ]
    : [["list"]],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
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
        command: `pnpm exec next start --port ${e2ePort}`,
        cwd: ".",
        url: baseURL,
        reuseExistingServer: !isCi,
        timeout: 120_000,
        env: createE2eServerEnv(),
      },
});
