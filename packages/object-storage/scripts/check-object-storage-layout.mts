/**
 * Fail-closed layout guard for @afenda/object-storage.
 * ARCH-1002 §8: three top-level slices + full template bucket set per slice.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  bannedBucketNames,
  featurePublicDoorFiles,
  featureTemplateBuckets,
} from "../../_scaffold/scripts/lib/scaffold-grammar.mts";

const packageRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = path.join(packageRoot, "src");

const allowedTopDirs = new Set(["blob", "r2", "_object-storage-integration"]);
const allowedRootFiles = new Set<string>(featurePublicDoorFiles);
const templateBucketSet = new Set<string>(featureTemplateBuckets);

const problems: string[] = [];

function rel(filePath: string) {
  return path
    .relative(packageRoot, filePath)
    .split(path.sep)
    .join("/")
    .replace(/^/, "packages/object-storage/");
}

function assertVerticalBuckets(sliceName: string, sliceDir: string) {
  if (!fs.existsSync(sliceDir)) {
    problems.push(`Missing required slice: packages/object-storage/src/${sliceName}/`);
    return;
  }

  const entries = fs.readdirSync(sliceDir, { withFileTypes: true });
  const dirNames = entries.filter((e) => e.isDirectory()).map((e) => e.name);

  for (const bucket of featureTemplateBuckets) {
    if (!dirNames.includes(bucket)) {
      problems.push(
        `Slice ${sliceName}/ missing ARCH-1002 §8 bucket "${bucket}/"`,
      );
    }
  }

  for (const entry of entries) {
    if (entry.isFile()) {
      problems.push(
        `Slice ${sliceName}/ must not contain loose files — use template buckets: ${rel(path.join(sliceDir, entry.name))}`,
      );
      continue;
    }

    if (!entry.isDirectory()) {
      continue;
    }

    if (bannedBucketNames.has(entry.name)) {
      problems.push(`Banned bucket "${entry.name}/" in ${sliceName}/`);
    }

    if (!templateBucketSet.has(entry.name)) {
      problems.push(
        `Unexpected bucket "${entry.name}/" in ${sliceName}/ (ARCH-1002 §8 template buckets only)`,
      );
    }
  }
}

function checkNoLegacyPackageRootR2() {
  const legacyR2Dir = path.join(packageRoot, "r2");
  if (fs.existsSync(legacyR2Dir)) {
    problems.push(
      "Forbidden package-root r2/ folder — move infra into packages/object-storage/src/r2/ (e.g. policies/cors.json)",
    );
  }
}

function checkLayout() {
  if (!fs.existsSync(srcDir)) {
    problems.push("packages/object-storage/src is missing");
    return;
  }

  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const entryRel = rel(path.join(srcDir, entry.name));

    if (entry.isDirectory()) {
      if (!allowedTopDirs.has(entry.name)) {
        problems.push(
          `Forbidden top-level folder (only blob/, r2/, _object-storage-integration/ allowed): ${entryRel}`,
        );
      }
      continue;
    }

    if (entry.isFile() && !allowedRootFiles.has(entry.name)) {
      problems.push(
        `Forbidden top-level file (only ${[...featurePublicDoorFiles].join(", ")} allowed): ${entryRel}`,
      );
    }
  }

  for (const door of featurePublicDoorFiles) {
    if (!fs.existsSync(path.join(srcDir, door))) {
      problems.push(`Missing required export door: packages/object-storage/src/${door}`);
    }
  }

  for (const slice of allowedTopDirs) {
    assertVerticalBuckets(slice, path.join(srcDir, slice));
  }
}

function checkNoDbInApiHandlers() {
  const apiDir = path.join(srcDir, "_object-storage-integration", "api");
  if (!fs.existsSync(apiDir)) {
    return;
  }

  for (const entry of fs.readdirSync(apiDir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".ts")) {
      continue;
    }

    const content = fs.readFileSync(path.join(apiDir, entry.name), "utf8");
    if (content.includes("@afenda/db")) {
      problems.push(
        `ARCH-1004 §7: api handler must not import @afenda/db — inject data port from apps/erp route: ${rel(path.join(apiDir, entry.name))}`,
      );
    }
  }
}

checkLayout();
checkNoLegacyPackageRootR2();
checkNoDbInApiHandlers();

if (problems.length > 0) {
  console.error("[object-storage:layout] Violations:");
  for (const problem of problems) {
    console.error(`- ${problem}`);
  }
  process.exit(1);
}

console.log(
  "[object-storage:layout] ARCH-1002 §8 compliant (blob | r2 | _object-storage-integration)",
);
