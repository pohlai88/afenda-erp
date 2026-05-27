import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  ARTIFACTS_ROOT,
  PLAYWRIGHT_JUNIT_PATH,
  PLAYWRIGHT_TEST_RESULTS_DIR,
  VITEST_BLOB_REPORTS_DIR,
  VITEST_BLOB_REPORTS_LINK,
  VITEST_COVERAGE_DIR,
} from "./lib/artifacts-paths.mts";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const ignoredDirectoryNames = new Set([
  "node_modules",
  ".next",
  ".turbo",
  "dist",
  ".vercel",
]);

const disallowedDirectoryNames = new Set([
  "coverage",
  "test-results",
  "playwright-report",
  "blob-report",
]);

const allowedArtifactDirectories = new Set(
  [
    ARTIFACTS_ROOT,
    `${ARTIFACTS_ROOT}/coverage`,
    `${ARTIFACTS_ROOT}/logs`,
    `${ARTIFACTS_ROOT}/playwright`,
    PLAYWRIGHT_TEST_RESULTS_DIR,
    `${ARTIFACTS_ROOT}/reports`,
    VITEST_BLOB_REPORTS_DIR,
  ].map(normalize),
);

const allowedFiles = new Set([normalize(PLAYWRIGHT_JUNIT_PATH)]);

const flatArtifactFilePatterns = [
  /^vitest-failures\.txt$/,
  /^vitest-report\.json$/,
  /^vitest-junit\.xml$/,
  /^.+\.log$/,
];

const problems: string[] = [];

function normalize(value: string) {
  return value.split(path.sep).join("/");
}

function relativePath(value: string) {
  return normalize(path.relative(root, value));
}

function isIgnoredDirectory(name: string) {
  return ignoredDirectoryNames.has(name);
}

function walk(dir: string) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    const rel = relativePath(fullPath);

    if (entry.isDirectory()) {
      if (isIgnoredDirectory(entry.name) || rel === VITEST_BLOB_REPORTS_LINK) {
        continue;
      }

      if (
        disallowedDirectoryNames.has(entry.name) &&
        !allowedArtifactDirectories.has(rel)
      ) {
        problems.push(`Disallowed artifact directory: ${rel}`);
      }

      walk(fullPath);
      continue;
    }

    if (entry.isFile()) {
      if (entry.name === "junit.xml" && !allowedFiles.has(rel)) {
        problems.push(`Disallowed loose JUnit report: ${rel}`);
      }

      if (
        path.dirname(rel) === ARTIFACTS_ROOT &&
        flatArtifactFilePatterns.some((pattern) => pattern.test(entry.name))
      ) {
        problems.push(
          `Flat artifact file must be moved under logs/ or reports/: ${rel}`,
        );
      }
    }
  }
}

const vitestLink = path.join(root, VITEST_BLOB_REPORTS_LINK);
if (fs.existsSync(vitestLink)) {
  const linkStat = fs.lstatSync(vitestLink);
  if (!linkStat.isSymbolicLink()) {
    problems.push(
      `${VITEST_BLOB_REPORTS_LINK} must be a junction/symlink to ${VITEST_BLOB_REPORTS_DIR}`,
    );
  } else {
    const target = fs.realpathSync(vitestLink);
    const expected = fs.realpathSync(path.join(root, VITEST_BLOB_REPORTS_DIR));
    if (target !== expected) {
      problems.push(
        `${VITEST_BLOB_REPORTS_LINK} points to ${relativePath(target)}, expected ${VITEST_BLOB_REPORTS_DIR}`,
      );
    }
  }
}

walk(root);

if (problems.length > 0) {
  console.error("[artifacts:check] Invalid generated artifact layout:");
  for (const problem of problems) {
    console.error(`- ${problem}`);
  }
  process.exit(1);
}

console.log(
  "[artifacts:check] generated artifacts are confined to .artifacts/",
);
