import fs from "node:fs";
import path from "node:path";
import {
  appRouteAllowedTsxNames,
  bannedBucketNames,
  featurePublicDoorFiles,
  getRepositoryRoot,
  isBannedBucketName,
  readTemplateBuckets,
} from "./lib/feature-bucket-grammar.mts";

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
const templateBuckets = readTemplateBuckets(root);
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

if (rel.startsWith("apps/erp/src/")) {
  validateAppPath(rel);
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
