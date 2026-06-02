import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import {
  appRouteAllowedTsxNames,
  bannedBucketNames,
  featurePublicDoorFiles,
  featureTemplateBuckets,
  getRepositoryRoot,
  isBannedBucketName,
  readFeatureTemplateBuckets,
} from "./lib/scaffold-grammar.mts";

const root = getRepositoryRoot();

const args = new Map<string, string>();
for (let i = 2; i < process.argv.length; i += 1) {
  const key = process.argv[i];
  const value = process.argv[i + 1];
  if (key?.startsWith("--") && value) {
    args.set(key, value);
  }
}

const rawPath = args.get("--path");

if (!rawPath) {
  process.exit(0);
}

const fullPath = path.isAbsolute(rawPath)
  ? rawPath
  : path.resolve(root, rawPath);
const rel = fullPath
  .split(path.sep)
  .join("/")
  .replace(`${root.replace(/\\/g, "/")}/`, "");
const problems: string[] = [];
const templateBuckets = readFeatureTemplateBuckets(root);
const templateBucketSet = new Set(templateBuckets);
const allowedFeatureRootEntries = new Set([
  ".turbo",
  "AGENTS.md",
  "README.md",
  "dist",
  "node_modules",
  "package.json",
  "src",
  "tsconfig.build.json",
  "tsconfig.json",
  "vitest.config.ts",
]);

function isFeaturePath(relativePath: string) {
  return relativePath.startsWith("packages/features/");
}

function featureRootEntry(relativePath: string) {
  const match = relativePath.match(/^packages\/features\/[^/]+\/([^/]+)/);
  return match?.[1] ?? "";
}

function afterFeatureSrc(relativePath: string) {
  const srcLayout = relativePath.match(
    /^packages\/features\/[^/]+\/src\/(.+)$/,
  );
  return srcLayout?.[1] ?? "";
}

function validateFeaturePath(relativePath: string) {
  for (const banned of bannedBucketNames) {
    if (
      relativePath.includes(`/${banned}/`) ||
      relativePath.endsWith(`/${banned}`)
    ) {
      problems.push(
        `Banned folder "${banned}" in feature path: ${relativePath}`,
      );
    }
  }

  const rootEntry = featureRootEntry(relativePath);
  if (rootEntry && !allowedFeatureRootEntries.has(rootEntry)) {
    problems.push(
      `Feature source files, buckets, and vertical slices must live under src/: ${relativePath}`,
    );
    return;
  }

  const afterBase = afterFeatureSrc(relativePath);
  if (!afterBase) {
    return;
  }

  const segments = afterBase.split("/");
  if (segments.length === 1) {
    const leaf = segments[0] ?? "";
    const isDoor = featurePublicDoorFiles.includes(
      leaf as (typeof featurePublicDoorFiles)[number],
    );
    const isAllowedBucket = templateBucketSet.has(leaf);
    if (!isDoor && !isAllowedBucket && !leaf.endsWith(".md")) {
      if (leaf.includes(".")) {
        problems.push(
          `Unexpected top-level source file in feature package: ${relativePath}`,
        );
      }
    }
  }

  for (const segment of segments) {
    if (isBannedBucketName(segment)) {
      problems.push(
        `Banned segment "${segment}" in feature path: ${relativePath}`,
      );
    }
  }
}

const objectStorageAllowedTop = new Set([
  "blob",
  "r2",
  "_object-storage-integration",
]);
const objectStorageDoorFiles = new Set<string>(featurePublicDoorFiles);
const objectStorageTemplateBuckets = new Set<string>(featureTemplateBuckets);

function validateObjectStoragePath(relativePath: string) {
  if (!relativePath.startsWith("packages/object-storage/src/")) {
    return;
  }

  for (const banned of bannedBucketNames) {
    if (
      relativePath.includes(`/${banned}/`) ||
      relativePath.endsWith(`/${banned}`)
    ) {
      problems.push(
        `Banned folder "${banned}" in object-storage path: ${relativePath}`,
      );
    }
  }

  if (
    relativePath.includes("/src/handlers/") ||
    relativePath.includes("/src/providers/") ||
    relativePath.includes("/src/auth/") ||
    relativePath.includes("/src/env/") ||
    relativePath.includes("/src/errors/") ||
    relativePath.includes("/_object-storage-integration/auth/") ||
    relativePath.includes("/_object-storage-integration/env/") ||
    relativePath.includes("/_object-storage-integration/errors/") ||
    relativePath.includes("/_object-storage-integration/client/")
  ) {
    problems.push(
      `Non-ARCH bucket path in object-storage (use ARCH-1002 §8 template buckets): ${relativePath}`,
    );
  }

  const afterSrc = relativePath.replace(/^packages\/object-storage\/src\//, "");
  const segments = afterSrc.split("/");
  const top = segments[0] ?? "";

  if (segments.length === 1 && afterSrc.includes(".")) {
    if (!objectStorageDoorFiles.has(segments[0] ?? "")) {
      problems.push(
        `Forbidden top-level file in object-storage src/ (only ${featurePublicDoorFiles.join(", ")}): ${relativePath}`,
      );
    }
    return;
  }

  if (top && !objectStorageAllowedTop.has(top)) {
    problems.push(
      `Forbidden top-level folder "${top}/" — object-storage src/ allows ONLY blob/, r2/, _object-storage-integration/: ${relativePath}`,
    );
    return;
  }

  if (objectStorageAllowedTop.has(top) && segments.length >= 2) {
    if (segments.length === 2 && segments[1] && !segments[1].includes(".")) {
      problems.push(
        `Slice ${top}/ bucket "${segments[1]}" must be a directory, not a file: ${relativePath}`,
      );
    }

    const bucket = segments[1] ?? "";
    if (bucket && !objectStorageTemplateBuckets.has(bucket)) {
      problems.push(
        `Slice ${top}/ bucket "${bucket}/" is not an ARCH-1002 §8 template bucket: ${relativePath}`,
      );
    }
  }
}

function validateAppPath(relativePath: string) {
  if (
    !relativePath.startsWith("apps/erp/src/app/") ||
    !relativePath.endsWith(".tsx")
  ) {
    return;
  }

  const transitionAllowList = new Set<string>();
  const fileName = path.basename(relativePath);
  if (
    !appRouteAllowedTsxNames.has(fileName) &&
    !transitionAllowList.has(relativePath)
  ) {
    problems.push(`Non-route TSX file inside app tree: ${relativePath}`);
  }
}

if (isFeaturePath(rel)) {
  validateFeaturePath(rel);
}

if (rel.startsWith("packages/object-storage/src/")) {
  validateObjectStoragePath(rel);
}

if (rel.startsWith("apps/erp/src/")) {
  validateAppPath(rel);
}

if (rel.includes("employee-management/") && isFeaturePath(rel)) {
  const script = path.join(
    root,
    "packages/features/hr-suite/scripts/check-hr-feature-vertical-naming.mts",
  );
  if (fs.existsSync(script)) {
    const result = spawnSync("pnpm", ["exec", "tsx", script], {
      cwd: root,
      encoding: "utf8",
      shell: process.platform === "win32",
    });
    if (result.status !== 0) {
      const output = [result.stdout, result.stderr].filter(Boolean).join("\n");
      problems.push(
        output.trim() || "HR vertical naming check failed (see script output)",
      );
    }
  }
}

if (problems.length > 0) {
  console.error("[validate-feature-shape] Violations:");
  for (const problem of problems) {
    console.error(`- ${problem}`);
  }
  process.exit(1);
}

if (fs.existsSync(fullPath)) {
  process.exit(0);
}
