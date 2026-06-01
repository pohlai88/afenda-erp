/**
 * Validates shipped HR vertical slices: naming discipline + compliance reference-slice pattern.
 * Golden path: employee-management/compliance-regulatory-tracking (rule afenda-hr-reference-slice).
 * Run: pnpm exec tsx packages/features/hr-suite/scripts/check-hr-feature-vertical-naming.mts
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = path.join(root, "src");
const testsDir = path.join(root, "tests", "unit");

const ALLOWED_ROOT_DIRECTORIES = new Set([
  "employee-management",
  "hr-suite-integration",
  "industry-specific",
  "payroll-compensation",
  "talent-management",
  "time-attendance",
]);

const FORBIDDEN_ROOT_BUCKETS = new Set([
  "actions",
  "components",
  "contracts",
  "data",
  "events",
  "navigation",
  "policies",
  "schemas",
  "surface",
  "tests",
]);

const HR_SUITE_INTEGRATION_DOORS = new Set([
  "client.ts",
  "index.ts",
  "metadata.ts",
  "server.ts",
]);

const HR_SUITE_INTEGRATION_IMPLEMENTATION_DIRS = new Set([
  "actions",
  "components",
  "contracts",
  "navigation",
  "policies",
  "surface",
]);

const HR_SUITE_INTEGRATION_LOCAL_DOCS = new Set([
  "hr-suite-integration-architecture.md",
]);

/** Capability folders with as-built implementation (expand as slices ship). */
export const SHIPPED_CAPABILITIES = [
  "employee-management/compliance-regulatory-tracking",
  "employee-management/documents-management",
  "employee-management/employee-lifecycle-management",
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
  "talent-management/performance-appraisals",
  "talent-management/recruitment-onboarding",
  "talent-management/training-development",
  "time-attendance/leave-attendance-management",
  "time-attendance/time-clock-integration",
] as const;

/** Canonical slice agents must clone — do not delete while other slices ship. */
export const HR_REFERENCE_SLICE_CAPABILITY =
  "employee-management/compliance-regulatory-tracking" as const;

const DOOR_FILES = new Set([
  "server.ts",
  "client.ts",
  "metadata.ts",
  "index.ts",
]);

const REQUIRED_BUCKETS = [
  "actions",
  "components",
  "contracts",
  "data",
  "events",
  "policies",
  "schemas",
  "surface",
] as const;

const IMPLEMENTATION_FILE =
  /^hr\.[a-z0-9]+(?:\.[a-z0-9-]+)*\.[a-z0-9-]+\.(?:actions\.server|policy\.server|page-model\.server|shared\.server|surface|shared|schema|contract|event|component\.(?:client|server))\.tsx?$/;

const problems: string[] = [];

function rel(filePath: string) {
  return path.relative(root, filePath).split(path.sep).join("/");
}

function listFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFiles(full));
    } else {
      files.push(full);
    }
  }
  return files;
}

function validateCapability(capabilityRel: string) {
  const capabilityDir = path.join(srcDir, capabilityRel);
  if (!fs.existsSync(capabilityDir)) {
    problems.push(`Missing shipped capability directory: ${capabilityRel}`);
    return;
  }

  for (const bucket of REQUIRED_BUCKETS) {
    const bucketDir = path.join(capabilityDir, bucket);
    if (!fs.existsSync(bucketDir)) {
      problems.push(`${capabilityRel}: missing required bucket "${bucket}/"`);
    }
  }

  for (const door of ["server.ts", "client.ts", "metadata.ts"] as const) {
    if (!fs.existsSync(path.join(capabilityDir, door))) {
      problems.push(`${capabilityRel}: missing slice door "${door}"`);
    }
  }

  const files = listFiles(capabilityDir);
  for (const file of files) {
    const fileRel = rel(file);
    const base = path.basename(file);

    if (base.endsWith("-architecture.md")) continue;
    if (base === ".gitkeep") continue;
    if (base === "index.ts") continue;
    if (DOOR_FILES.has(base)) continue;

    if (fileRel.includes("/data/") && base.endsWith(".surface.ts")) {
      problems.push(
        `${fileRel}: list surfaces belong in surface/, not data/ (see @afenda/feature-system-admin)`,
      );
    }

    if (!IMPLEMENTATION_FILE.test(base)) {
      problems.push(
        `${fileRel}: expected hr.<domain>.<purpose>.<role>.<ext> naming (mirrors system-admin.<slice>.*)`,
      );
    }
  }

  const surfaceDir = path.join(capabilityDir, "surface");
  if (fs.existsSync(surfaceDir)) {
    const surfaceFiles = fs
      .readdirSync(surfaceDir)
      .filter(
        (name) => name.endsWith(".surface.ts") || name.endsWith(".shared.ts"),
      );
    if (surfaceFiles.length === 0) {
      problems.push(
        `${capabilityRel}: surface/ bucket has no surface or copy files`,
      );
    }
  }

  validateReferenceSlicePattern(capabilityRel, capabilityDir);
}

function fileExistsMatching(dir: string, pattern: RegExp): boolean {
  if (!fs.existsSync(dir)) return false;
  return fs.readdirSync(dir).some((name) => pattern.test(name));
}

function readFileIfExists(filePath: string): string {
  if (!fs.existsSync(filePath)) return "";
  return fs.readFileSync(filePath, "utf8");
}

function validateHrSuiteRootDiscipline() {
  if (!fs.existsSync(srcDir)) {
    problems.push("Missing src/ directory");
    return;
  }

  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;

    if (FORBIDDEN_ROOT_BUCKETS.has(entry.name)) {
      problems.push(
        `src/${entry.name}: root bucket is forbidden; move capability code under src/<category>/<capability>/ or suite glue under src/hr-suite-integration/`,
      );
      continue;
    }

    if (!ALLOWED_ROOT_DIRECTORIES.has(entry.name)) {
      problems.push(
        `src/${entry.name}: unexpected HR Suite root directory; add capability code under an approved HR category or document the architecture exception`,
      );
    }
  }
}

function validateHrSuiteIntegrationDoors() {
  const integrationDir = path.join(srcDir, "hr-suite-integration");

  if (!fs.existsSync(integrationDir)) {
    problems.push("Missing src/hr-suite-integration/ directory");
    return;
  }

  for (const door of HR_SUITE_INTEGRATION_DOORS) {
    if (!fs.existsSync(path.join(integrationDir, door))) {
      problems.push(
        `src/hr-suite-integration/${door}: missing integration door`,
      );
    }
  }

  for (const entry of fs.readdirSync(integrationDir, { withFileTypes: true })) {
    if (
      entry.isFile() &&
      !HR_SUITE_INTEGRATION_DOORS.has(entry.name) &&
      !HR_SUITE_INTEGRATION_LOCAL_DOCS.has(entry.name)
    ) {
      problems.push(
        `src/hr-suite-integration/${entry.name}: integration root may only contain client.ts, index.ts, metadata.ts, server.ts, and approved local architecture docs`,
      );
    }

    if (
      entry.isDirectory() &&
      !HR_SUITE_INTEGRATION_IMPLEMENTATION_DIRS.has(entry.name)
    ) {
      problems.push(
        `src/hr-suite-integration/${entry.name}: unexpected integration implementation directory`,
      );
    }
  }
}

function validateHrSuiteIntegrationImports() {
  const integrationDir = path.join(srcDir, "hr-suite-integration");
  const deepImportPattern =
    /hr-suite-integration\/(?:actions|components|contracts|navigation|policies|surface)\//;

  for (const file of listFiles(srcDir)) {
    if (!/\.(?:ts|tsx)$/.test(file)) continue;
    if (file.startsWith(integrationDir)) continue;

    const body = readFileIfExists(file).replaceAll("\\", "/");
    if (deepImportPattern.test(body)) {
      problems.push(
        `${rel(file)}: import hr-suite-integration through ./hr-suite-integration, ./client, ./server, or ./metadata instead of a deep implementation path`,
      );
    }
  }
}

/** Pattern learned from compliance-regulatory-tracking (see docs/hr-reference-slice-checklist.md). */
function validateReferenceSlicePattern(
  capabilityRel: string,
  capabilityDir: string,
) {
  const slug = path.basename(capabilityDir);
  const archPath = path.join(capabilityDir, `${slug}-architecture.md`);
  const archBody = readFileIfExists(archPath);

  if (!archBody.includes("## As-built summary")) {
    problems.push(
      `${capabilityRel}: ${slug}-architecture.md must include "## As-built summary" (copy compliance doc structure)`,
    );
  }

  const requiredRelative = [
    ["policies", /-access\.policy\.server\.ts$/],
    ["data", /\.page-model\.server\.ts$/],
    ["data", /search-params\.parse\.shared\.ts$/],
    ["surface", /-surface-metadata\.shared\.ts$/],
    ["surface", /-ui\.copy\.shared\.ts$/],
    ["components", /-section\.component\.server\.tsx$/],
  ] as const;

  for (const [bucket, pattern] of requiredRelative) {
    const bucketDir = path.join(capabilityDir, bucket);
    if (!fileExistsMatching(bucketDir, pattern)) {
      problems.push(
        `${capabilityRel}: missing reference-slice file in ${bucket}/ matching ${pattern}`,
      );
    }
  }

  const metadataPath = path.join(capabilityDir, "metadata.ts");
  const metadataBody = readFileIfExists(metadataPath);
  if (!metadataBody.includes("surface-metadata")) {
    problems.push(
      `${capabilityRel}: metadata.ts must re-export surface registry (see compliance metadata.ts)`,
    );
  }

  const surfaceMetaDir = path.join(capabilityDir, "surface");
  const registryFile = fs.existsSync(surfaceMetaDir)
    ? fs
        .readdirSync(surfaceMetaDir)
        .find((name) => name.endsWith("-surface-metadata.shared.ts"))
    : undefined;
  if (registryFile) {
    const registryBody = readFileIfExists(
      path.join(surfaceMetaDir, registryFile),
    );
    if (!/_LIST_SURFACE_KEYS/.test(registryBody)) {
      problems.push(
        `${capabilityRel}: surface registry must export *_LIST_SURFACE_KEYS (ARCH-006 workbench registry)`,
      );
    }
  }

  const slugToken = slug.replace(/-regulatory-tracking$/, "").replace(/-/g, "");
  const testPrefix = slug.includes("compliance") ? "compliance" : slugToken;
  const testFiles = fs.existsSync(testsDir)
    ? fs.readdirSync(testsDir).filter((name) => name.includes(testPrefix))
    : [];
  if (testFiles.length < 3) {
    problems.push(
      `${capabilityRel}: expected at least 3 Vitest files under tests/unit/*${testPrefix}* (registry, search-params, list contract)`,
    );
  }
}

validateHrSuiteRootDiscipline();
validateHrSuiteIntegrationDoors();
validateHrSuiteIntegrationImports();

for (const capability of SHIPPED_CAPABILITIES) {
  validateCapability(capability);
}

if (!fs.existsSync(path.join(srcDir, HR_REFERENCE_SLICE_CAPABILITY))) {
  problems.push(
    `Missing HR reference slice directory: ${HR_REFERENCE_SLICE_CAPABILITY} (required golden path)`,
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
  `[check-hr-feature-vertical-naming] OK (${SHIPPED_CAPABILITIES.length} shipped capability slice(s))`,
);
