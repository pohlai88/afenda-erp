/**
 * Validates shipped HR vertical slices against GUARD 5 flat tiered layout.
 * Legacy bucket-folder checks are superseded by scripts/guard-packages-layout.mts.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  HR_TIERED_FLAT_FILE,
  scanPackageSrc,
  type PackageScanTarget,
} from "../../../../scripts/lib/packages-layout.mts";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = path.join(root, "src");
const testsDir = path.join(root, "tests", "unit");

const target: PackageScanTarget = {
  packageDirName: "hr-suite",
  packageRel: "packages/features/hr-suite",
  srcRoot: srcDir,
  packageDir: root,
};

const problems: string[] = [];
scanPackageSrc(target, problems);

/** Shipped capability folders (flat layer 3). */
export const SHIPPED_CAPABILITIES = [
  "employee-management/compliance-regulatory-tracking",
  "employee-management/documents-management",
  "employee-management/employee-lifecycle-management",
  "employee-management/employee-selfservice-portal",
  "employee-management/offboarding-exit-management",
  "employee-management/employee-records-management",
  "employee-management/organizational-chart-hierarchy",
  "industry-specific/field-worker-remote-workforce-management",
  "industry-specific/food-handler-certification-health-compliance",
  "industry-specific/government-classification-pay-grades",
  "industry-specific/manufacturing-safety-training-osha-compliance",
  "industry-specific/retail-seasonal-hourly-workforce-scheduling",
  "industry-specific/union-management",
  "payroll-compensation/benefits-administration",
  "talent-management/candidate-selfservice-portal",
  "talent-management/employee-engagement-surveys",
  "talent-management/performance-appraisals",
  "talent-management/recruitment-onboarding",
  "talent-management/training-development",
  "time-attendance/leave-attendance-management",
  "time-attendance/time-clock-integration",
] as const;

const HR_REFERENCE_SLICE_CAPABILITY =
  "employee-management/compliance-regulatory-tracking";

for (const capability of SHIPPED_CAPABILITIES) {
  const capabilityDir = path.join(srcDir, ...capability.split("/"));
  if (!fs.existsSync(capabilityDir)) {
    problems.push(`Missing shipped capability directory: ${capability}`);
    continue;
  }

  for (const entry of fs.readdirSync(capabilityDir, { withFileTypes: true })) {
    if (entry.isDirectory() && entry.name !== "tests") {
      problems.push(`${capability}/${entry.name}/ — capability layer must stay flat (GUARD 5)`);
    }
  }

  const hrFiles = fs
    .readdirSync(capabilityDir)
    .filter((name) => name.endsWith(".ts") || name.endsWith(".tsx"));
  if (hrFiles.length === 0) {
    problems.push(`${capability}: no flat implementation files`);
  }
  for (const file of hrFiles) {
    if (file.endsWith(".md")) continue;
    if (["client.ts", "server.ts", "index.ts", "metadata.ts"].includes(file)) {
      continue;
    }
    if (!HR_TIERED_FLAT_FILE.test(file) && !/^hr\.[a-z0-9.-]+\.(ts|tsx)$/.test(file)) {
      problems.push(`${capability}/${file}: expected hr.* tiered flat naming`);
    }
  }

  const slug = capability.split("/").pop() ?? capability;
  const slugToken = slug.replace(/-regulatory-tracking$/, "").replace(/-/g, "");
  const testPrefix = slug.includes("compliance") ? "compliance" : slugToken;
  const testFiles = fs.existsSync(testsDir)
    ? fs.readdirSync(testsDir).filter((name) => name.includes(testPrefix))
    : [];
  if (testFiles.length < 1) {
    problems.push(
      `${capability}: expected Vitest coverage under tests/unit/*${testPrefix}*`,
    );
  }
}

if (!fs.existsSync(path.join(srcDir, HR_REFERENCE_SLICE_CAPABILITY))) {
  problems.push(
    `Missing HR reference slice directory: ${HR_REFERENCE_SLICE_CAPABILITY}`,
  );
}

if (problems.length > 0) {
  console.error("[check-hr-feature-vertical-naming] Violations:");
  for (const problem of problems) {
    console.error(`- ${problem}`);
  }
  process.exit(1);
}

console.log(
  `[check-hr-feature-vertical-naming] OK (${SHIPPED_CAPABILITIES.length} shipped capability slice(s), GUARD 5 flat tiered)`,
);
