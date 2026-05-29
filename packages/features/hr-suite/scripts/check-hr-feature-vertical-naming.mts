/**
 * Validates shipped HR feature vertical slices follow system-admin naming discipline.
 * Run: pnpm exec tsx packages/features/hr-suite/scripts/check-hr-feature-vertical-naming.mts
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = path.join(root, "src");

/** Capability folders with as-built implementation (expand as slices ship). */
const SHIPPED_CAPABILITIES = [
  "employee-management/compliance-regulatory-tracking",
] as const;

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
  /^hr\.[a-z0-9]+(?:\.[a-z0-9-]+)*\.[a-z0-9-]+\.(?:actions\.server|policy\.server|page-model\.server|surface|shared|schema|contract|event|component\.(?:client|server))\.tsx?$/;

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
      .filter((name) => name.endsWith(".surface.ts") || name.endsWith(".shared.ts"));
    if (surfaceFiles.length === 0) {
      problems.push(`${capabilityRel}: surface/ bucket has no surface or copy files`);
    }
  }
}

for (const capability of SHIPPED_CAPABILITIES) {
  validateCapability(capability);
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
