/**
 * Canonical paths under `.artifacts/` (gitignored). Keeps ad-hoc output out of repo root.
 */
import fs from "node:fs";
import path from "node:path";

export const ARTIFACTS_ROOT = ".artifacts";

export const ARTIFACTS_LOGS_DIR = `${ARTIFACTS_ROOT}/logs`;
export const ARTIFACTS_REPORTS_DIR = `${ARTIFACTS_ROOT}/reports`;

export const PLAYWRIGHT_DIR = `${ARTIFACTS_ROOT}/playwright`;
export const PLAYWRIGHT_AUTH_DIR = `${PLAYWRIGHT_DIR}/.auth`;
export const PLAYWRIGHT_BLOB_REPORT_DIR = `${PLAYWRIGHT_DIR}/blob-report`;
export const PLAYWRIGHT_JUNIT_PATH = `${PLAYWRIGHT_DIR}/junit.xml`;
export const PLAYWRIGHT_TEST_RESULTS_DIR = `${PLAYWRIGHT_DIR}/test-results`;

export const VITEST_BLOB_REPORTS_DIR = `${ARTIFACTS_ROOT}/vitest-reports`;
export const VITEST_BLOB_REPORTS_LINK = ".vitest-reports";
export const VITEST_COVERAGE_DIR = `${ARTIFACTS_ROOT}/coverage`;

const REPORT_BASENAMES = new Set([
  "vitest-failures.txt",
  "vitest-report.json",
  "vitest-junit.xml",
]);

export function artifactsPath(root: string, ...segments: string[]) {
  return path.join(root, ARTIFACTS_ROOT, ...segments);
}

export function artifactsReportPath(root: string, basename: string) {
  return artifactsPath(root, "reports", basename);
}

export function artifactsLogPath(root: string, basename: string) {
  return artifactsPath(root, "logs", basename);
}

export function vitestCoveragePath(root: string, packageName: string) {
  return path.join(root, VITEST_COVERAGE_DIR, packageName);
}

export function ensureArtifactsSubdirs(root: string) {
  const dirs = [
    ARTIFACTS_LOGS_DIR,
    ARTIFACTS_REPORTS_DIR,
    PLAYWRIGHT_DIR,
    PLAYWRIGHT_AUTH_DIR,
    PLAYWRIGHT_BLOB_REPORT_DIR,
    PLAYWRIGHT_TEST_RESULTS_DIR,
    VITEST_COVERAGE_DIR,
    VITEST_BLOB_REPORTS_DIR,
  ];

  for (const rel of dirs) {
    fs.mkdirSync(path.join(root, rel), { recursive: true });
  }
}

function moveFileIfAbsent(from: string, to: string) {
  if (!fs.existsSync(from)) {
    return;
  }
  fs.mkdirSync(path.dirname(to), { recursive: true });
  if (!fs.existsSync(to)) {
    fs.renameSync(from, to);
  } else {
    fs.rmSync(from, { force: true });
  }
}

function moveDirectoryContents(fromDir: string, toDir: string) {
  if (!fs.existsSync(fromDir)) {
    return;
  }
  fs.mkdirSync(toDir, { recursive: true });
  for (const entry of fs.readdirSync(fromDir)) {
    const from = path.join(fromDir, entry);
    const to = path.join(toDir, entry);
    if (fs.existsSync(to)) {
      fs.rmSync(to, { recursive: true, force: true });
    }
    fs.renameSync(from, to);
  }
  fs.rmSync(fromDir, { recursive: true, force: true });
}

/**
 * Moves legacy Playwright output from apps/erp into `.artifacts/playwright/`.
 */
export function migrateLegacyPlaywrightArtifacts(root: string) {
  const legacyDirs = [
    path.join(root, "apps/erp/test-results"),
    path.join(root, "test-results"),
  ];
  const target = path.join(root, PLAYWRIGHT_TEST_RESULTS_DIR);

  for (const legacyDir of legacyDirs) {
    if (!fs.existsSync(legacyDir)) {
      continue;
    }
    moveDirectoryContents(legacyDir, target);
  }

  const legacyReport = path.join(root, "apps/erp/playwright-report");
  if (fs.existsSync(legacyReport)) {
    fs.rmSync(legacyReport, { recursive: true, force: true });
  }
}

/**
 * Moves legacy flat files from `.artifacts/` root into `logs/` or `reports/`.
 */
export function migrateLegacyFlatArtifacts(root: string) {
  const artifactsDir = path.join(root, ARTIFACTS_ROOT);
  if (!fs.existsSync(artifactsDir)) {
    return;
  }

  for (const entry of fs.readdirSync(artifactsDir, { withFileTypes: true })) {
    if (!entry.isFile()) {
      continue;
    }
    const name = entry.name;
    const from = path.join(artifactsDir, name);

    if (name.endsWith(".log")) {
      moveFileIfAbsent(from, artifactsLogPath(root, name));
      continue;
    }

    if (REPORT_BASENAMES.has(name)) {
      moveFileIfAbsent(from, artifactsReportPath(root, name));
    }
  }
}
