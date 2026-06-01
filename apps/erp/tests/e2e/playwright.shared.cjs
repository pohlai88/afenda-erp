/**
 * Shared Playwright configuration for @afenda/erp E2E and visual regression.
 *
 * Top-level runner options live here (Playwright docs: do not nest them under `use`).
 * @see https://playwright.dev/docs/test-configuration
 */
const path = require("node:path");
const os = require("node:os");

const repoRoot = path.join(__dirname, "../../../..");
const isCi = Boolean(process.env.CI);
const e2ePort = process.env.PLAYWRIGHT_PORT ?? "3100";
const baseURL =
  process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${e2ePort}`;
const neonAuthEnabled = process.env.AFENDA_NEON_AUTH_ENABLED === "1";

const TIMEOUTS = {
  /** Default per-test timeout (smoke, setup). */
  default: 60_000,
  /** HR governed workbench flows (list hydration). */
  authenticated: 360_000,
  /** Visual regression and interface lab. */
  visual: 300_000,
  action: 15_000,
  navigation: 45_000,
  webServerProduction: 120_000,
  webServerDevelopment: 300_000,
};

const PLAYWRIGHT_ARTIFACTS = {
  outputDir: path.join(repoRoot, ".artifacts/playwright/test-results"),
  junit: path.join(repoRoot, ".artifacts/playwright/junit.xml"),
  blobReport: path.join(repoRoot, ".artifacts/playwright/blob-report"),
  htmlReport: path.join(repoRoot, ".artifacts/playwright/html-report"),
  authState: path.join(
    repoRoot,
    ".artifacts/playwright/.auth/dev-session.json",
  ),
};

const SNAPSHOT_PATH_TEMPLATE =
  "{testDir}/{testFileDir}/{testFileName}-snapshots/{arg}{ext}";

const SHARED_EXPECT = {
  timeout: 10_000,
  toHaveScreenshot: {
    maxDiffPixelRatio: 0.02,
  },
};

function validatePlaywrightEnvironment() {
  try {
    const url = new URL(baseURL);
    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error("base URL must use http or https");
    }
  } catch (error) {
    throw new Error(
      `Invalid PLAYWRIGHT_BASE_URL "${baseURL}": ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }

  if (
    process.env.PLAYWRIGHT_PORT &&
    !/^\d+$/.test(process.env.PLAYWRIGHT_PORT)
  ) {
    throw new Error(
      `Invalid PLAYWRIGHT_PORT "${process.env.PLAYWRIGHT_PORT}": expected a TCP port number.`,
    );
  }
}

function ciWorkerCount() {
  if (!isCi) {
    return undefined;
  }

  return Math.min(4, Math.max(2, Math.floor(os.cpus().length / 2)));
}

function workerCount() {
  const configuredWorkers = process.env.PLAYWRIGHT_WORKERS;
  if (!configuredWorkers) {
    return ciWorkerCount();
  }

  const parsedWorkers = Number(configuredWorkers);
  if (Number.isInteger(parsedWorkers) && parsedWorkers > 0) {
    return parsedWorkers;
  }

  return configuredWorkers;
}

function shouldReuseExistingServer() {
  return !isCi && process.env.PLAYWRIGHT_REUSE_SERVER === "1";
}

function createE2eServerEnv(overrides = {}) {
  return {
    PORT: e2ePort,
    NODE_ENV: "production",
    AFENDA_DEV_AUTH_BYPASS: "0",
    AFENDA_NEON_AUTH_ENABLED: neonAuthEnabled ? "1" : "0",
    NEXT_PUBLIC_AFENDA_NEON_AUTH_ENABLED: neonAuthEnabled ? "1" : "0",
    AFENDA_E2E_DEV_AUTH: neonAuthEnabled ? "0" : "1",
    NEXT_PUBLIC_APP_NAME: "Afenda ERP",
    NEXT_PUBLIC_SITE_URL: baseURL,
    NEXT_PUBLIC_STAGE: isCi ? "ci" : "local",
    NEON_AUTH_BASE_URL: process.env.NEON_AUTH_BASE_URL ?? "",
    NEON_AUTH_COOKIE_SECRET: process.env.NEON_AUTH_COOKIE_SECRET ?? "",
    ...overrides,
  };
}

function createVisualDevServerEnv() {
  return {
    PORT: e2ePort,
    NODE_ENV: "development",
    AFENDA_NEON_AUTH_ENABLED: "0",
    NEXT_PUBLIC_AFENDA_NEON_AUTH_ENABLED: "0",
    AFENDA_E2E_DEV_AUTH: "1",
    NEON_AUTH_BASE_URL: "",
    NEON_AUTH_COOKIE_SECRET: "",
    NEXT_PUBLIC_APP_NAME: "Afenda ERP",
    NEXT_PUBLIC_SITE_URL: baseURL,
    NEXT_PUBLIC_STAGE: "local",
  };
}

function createSharedUse(overrides = {}) {
  return {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: isCi ? "retain-on-failure" : "off",
    actionTimeout: TIMEOUTS.action,
    navigationTimeout: TIMEOUTS.navigation,
    ...overrides,
  };
}

function createReporters() {
  return isCi
    ? [
        ["list"],
        ["junit", { outputFile: PLAYWRIGHT_ARTIFACTS.junit }],
        ["blob", { outputDir: PLAYWRIGHT_ARTIFACTS.blobReport }],
        [
          "html",
          { outputFolder: PLAYWRIGHT_ARTIFACTS.htmlReport, open: "never" },
        ],
      ]
    : [
        ["list"],
        [
          "html",
          { outputFolder: PLAYWRIGHT_ARTIFACTS.htmlReport, open: "never" },
        ],
      ];
}

function createWebServer({ command, env, timeout }) {
  if (process.env.PLAYWRIGHT_BASE_URL) {
    return undefined;
  }

  return {
    command,
    cwd: path.join(repoRoot, "apps/erp"),
    url: `${baseURL}/sign-in`,
    reuseExistingServer: shouldReuseExistingServer(),
    timeout,
    stdout: "pipe",
    stderr: "pipe",
    env,
  };
}

function createProductionWebServer() {
  return createWebServer({
    command: `pnpm exec next start --port ${e2ePort}`,
    env: createE2eServerEnv(),
    timeout: TIMEOUTS.webServerProduction,
  });
}

function createVisualDevWebServer() {
  return createWebServer({
    command: `pnpm exec next dev --port ${e2ePort}`,
    env: createVisualDevServerEnv(),
    timeout: TIMEOUTS.webServerDevelopment,
  });
}

function chromiumProject(useOverrides = {}) {
  const { devices } = require("@playwright/test");
  return {
    name: "chromium",
    use: {
      ...devices["Desktop Chrome"],
      ...useOverrides,
    },
  };
}

function createAuthSetupProject() {
  return {
    name: "auth-setup",
    testMatch: /auth\.setup\.ts/,
    retries: 0,
    timeout: TIMEOUTS.default,
  };
}

function createAuthenticatedProject({ name, testMatch, grep, extra = {} }) {
  return {
    ...chromiumProject({
      storageState: PLAYWRIGHT_ARTIFACTS.authState,
    }),
    name,
    dependencies: ["auth-setup"],
    testMatch,
    grep,
    retries: isCi ? 2 : 0,
    timeout: TIMEOUTS.authenticated,
    ...extra,
  };
}

const SMOKE_SPEC = /smoke\.spec\.ts/;
const HR_CRITICAL_SPECS =
  /hr-(records|org|lifecycle|geolocation|documents)\.spec\.ts/;
const SYSTEM_ADMIN_APPROVALS_SPEC = /system-admin-approvals\.spec\.ts/;
const SYSTEM_ADMIN_AUDIT_VIEWER_SPEC = /system-admin-audit-viewer\.spec\.ts/;
const SYSTEM_ADMIN_BILLING_SPEC = /system-admin-billing\.spec\.ts/;
const SYSTEM_ADMIN_CAPABILITIES_SPEC = /system-admin-capabilities\.spec\.ts/;
const SYSTEM_ADMIN_DATA_MANAGEMENT_SPEC = /system-admin-data-management\.spec\.ts/;

function createProductionProjects() {
  return [
    createAuthSetupProject(),
    {
      ...chromiumProject(),
      name: "chromium-public-smoke",
      testMatch: SMOKE_SPEC,
      grep: /@public/,
      retries: 0,
      timeout: TIMEOUTS.default,
    },
    createAuthenticatedProject({
      name: "chromium-authenticated-smoke",
      testMatch: SMOKE_SPEC,
      grep: /@authenticated/,
      extra: {
        retries: 0,
        timeout: TIMEOUTS.default,
      },
    }),
    {
      ...chromiumProject(),
      name: "chromium-dev-auth-flow",
      dependencies: neonAuthEnabled ? [] : ["auth-setup"],
      testMatch: SMOKE_SPEC,
      grep: /@dev-auth-flow/,
      retries: 0,
      timeout: TIMEOUTS.default,
    },
    {
      ...chromiumProject(),
      name: "chromium-neon-smoke",
      testMatch: SMOKE_SPEC,
      grep: /@neon/,
      retries: 0,
      timeout: TIMEOUTS.default,
    },
    createAuthenticatedProject({
      name: "chromium-hr-critical",
      testMatch: HR_CRITICAL_SPECS,
    }),
    createAuthenticatedProject({
      name: "chromium-system-admin-approvals",
      testMatch: SYSTEM_ADMIN_APPROVALS_SPEC,
    }),
    createAuthenticatedProject({
      name: "chromium-system-admin-audit-viewer",
      testMatch: SYSTEM_ADMIN_AUDIT_VIEWER_SPEC,
    }),
    createAuthenticatedProject({
      name: "chromium-system-admin-billing",
      testMatch: SYSTEM_ADMIN_BILLING_SPEC,
    }),
    createAuthenticatedProject({
      name: "chromium-system-admin-capabilities",
      testMatch: SYSTEM_ADMIN_CAPABILITIES_SPEC,
    }),
    createAuthenticatedProject({
      name: "chromium-system-admin-data-management",
      testMatch: SYSTEM_ADMIN_DATA_MANAGEMENT_SPEC,
    }),
    createAuthenticatedProject({
      name: "chromium-metadata-gallery",
      testMatch: /metadata-renderer-gallery\.spec\.ts/,
      extra: {
        timeout: TIMEOUTS.visual,
      },
    }),
    {
      ...chromiumProject(),
      name: "chromium-visual-public",
      testMatch: /ui-primitives-visual\.spec\.ts/,
      retries: 0,
      timeout: TIMEOUTS.visual,
    },
  ];
}

function createVisualDevProjects() {
  return [
    createAuthSetupProject(),
    createAuthenticatedProject({
      name: "chromium-visual-authenticated",
      testMatch: /metadata-renderer.*\.spec\.ts/,
      grep: /@visual/,
      extra: {
        timeout: TIMEOUTS.visual,
      },
    }),
    {
      ...chromiumProject(),
      name: "chromium-visual-public",
      testMatch: /ui-primitives-visual\.spec\.ts/,
      retries: 0,
      timeout: TIMEOUTS.visual,
    },
  ];
}

/**
 * @param {"production" | "visual-dev"} mode
 * @param {import('@playwright/test').PlaywrightTestConfig} [overrides]
 */
function defineAfendaPlaywrightConfig(mode, overrides = {}) {
  validatePlaywrightEnvironment();

  const isVisualDev = mode === "visual-dev";

  return {
    testDir: "./tests/e2e",
    outputDir: PLAYWRIGHT_ARTIFACTS.outputDir,
    fullyParallel: !isVisualDev,
    forbidOnly: isCi,
    workers: isVisualDev ? 1 : workerCount(),
    maxFailures: isCi ? 10 : undefined,
    reportSlowTests: { max: 5, threshold: 60_000 },
    timeout: TIMEOUTS.default,
    reporter: isVisualDev ? [["list"]] : createReporters(),
    use: createSharedUse(isVisualDev ? { video: "off" } : {}),
    snapshotPathTemplate: SNAPSHOT_PATH_TEMPLATE,
    expect: SHARED_EXPECT,
    projects: isVisualDev
      ? createVisualDevProjects()
      : createProductionProjects(),
    webServer: isVisualDev
      ? createVisualDevWebServer()
      : createProductionWebServer(),
    ...overrides,
  };
}

module.exports = {
  repoRoot,
  isCi,
  baseURL,
  e2ePort,
  neonAuthEnabled,
  TIMEOUTS,
  PLAYWRIGHT_ARTIFACTS,
  SNAPSHOT_PATH_TEMPLATE,
  SHARED_EXPECT,
  validatePlaywrightEnvironment,
  ciWorkerCount,
  workerCount,
  shouldReuseExistingServer,
  createE2eServerEnv,
  createVisualDevServerEnv,
  createSharedUse,
  createReporters,
  createProductionWebServer,
  createVisualDevWebServer,
  chromiumProject,
  defineAfendaPlaywrightConfig,
};
