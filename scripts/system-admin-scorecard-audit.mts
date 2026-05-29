#!/usr/bin/env tsx
/**
 * Partial automation for ARCH-011 competitive scorecard refresh.
 * Scans reliability/diagnostics instrumentation gaps and vertical test coverage.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const repoRoot = join(import.meta.dirname, "..");
const featureRoot = join(repoRoot, "packages/features/system-admin");

function read(path: string) {
  return readFileSync(path, "utf8");
}

function countMatches(content: string, pattern: RegExp) {
  return [...content.matchAll(pattern)].length;
}

function listTestFiles(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listTestFiles(fullPath));
      continue;
    }

    if (entry.name.endsWith(".test.ts")) {
      files.push(fullPath);
    }
  }

  return files;
}

const reliabilityChecks = read(
  join(featureRoot, "src/reliability/data/system-admin.reliability.checks.server.ts"),
);

const notInstrumented = countMatches(
  reliabilityChecks,
  /not instrumented/gi,
);
const workflowProbe = reliabilityChecks.includes("collectWorkflowReliabilityIssues");

const diagnosticsActions = read(
  join(featureRoot, "src/diagnostics/actions/system-admin.diagnostics.actions.server.ts"),
);
const diagnosticsExport = diagnosticsActions.includes(
  "system-admin.diagnostics.export",
);

const rolesActions = read(
  join(featureRoot, "src/roles/actions/system-admin.roles.actions.server.ts"),
);
const roleCrudSignals = [
  "updateSystemAdminRoleForm",
  "deprecateSystemAdminRoleForm",
  "reactivateSystemAdminRoleForm",
].filter((name) => rolesActions.includes(name));

const matrixFile = join(
  featureRoot,
  "src/capabilities/data/system-admin.capabilities-role-matrix.server.ts",
);
const capabilityMatrix = statSync(matrixFile, { throwIfNoEntry: false })
  ? true
  : false;

const testFiles = listTestFiles(join(featureRoot, "tests"));
const verticalTests = testFiles.filter((file) =>
  /system-admin\.(roles|capabilities|diagnostics|reliability|billing)/.test(file),
);

console.log("System Admin scorecard audit");
console.log("============================");
console.log(`Reliability 'not instrumented' placeholders: ${notInstrumented}`);
console.log(`Workflow health probe present: ${workflowProbe ? "yes" : "no"}`);
console.log(`Diagnostics audited export: ${diagnosticsExport ? "yes" : "no"}`);
console.log(`Role catalog mutations: ${roleCrudSignals.join(", ") || "none"}`);
console.log(`Capability role matrix module: ${capabilityMatrix ? "yes" : "no"}`);
console.log(`Vertical test files: ${verticalTests.length}`);
for (const file of verticalTests) {
  console.log(`  - ${relative(repoRoot, file)}`);
}

const scorecardPath = join(
  repoRoot,
  "docs/architecture/011-system-admin-competitive-scorecard.md",
);
console.log(`Scorecard doc: ${statSync(scorecardPath).mtime.toISOString().slice(0, 10)}`);

if (notInstrumented > 0) {
  console.log("\nAmber: reliability platform telemetry still incomplete.");
}

process.exit(0);
