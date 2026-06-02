import fs from "node:fs";
import path from "node:path";
import {
  featurePublicDoorFiles,
  getRepositoryRoot,
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

const feature = args.get("--feature");
const slice = args.get("--slice");

if (!feature) {
  console.error(
    "[validate-feature-entry] Usage: validate-feature-entry.mts --feature <moduleId> [--slice <capability>]",
  );
  process.exit(1);
}

const featureSrcDir = path.join(root, "packages", "features", feature, "src");
const sliceDir = slice ? path.join(featureSrcDir, slice) : featureSrcDir;

if (!fs.existsSync(sliceDir)) {
  console.error(`[validate-feature-entry] Missing source path: ${sliceDir}`);
  process.exit(1);
}

const problems: string[] = [];
const templateBuckets = new Set(readFeatureTemplateBuckets(root));

function requirePath(relativePath: string) {
  const fullPath = path.join(sliceDir, relativePath);
  if (!fs.existsSync(fullPath)) {
    problems.push(`Missing required entry file: ${relativePath}`);
  }
}

if (slice) {
  for (const bucket of readFeatureTemplateBuckets(root)) {
    const bucketPath = path.join(sliceDir, bucket);
    if (!fs.existsSync(bucketPath)) {
      problems.push(`Vertical slice "${slice}" is missing bucket "${bucket}".`);
    }
  }

  requirePath("index.ts");
  requirePath(path.join("components", "index.ts"));
  requirePath(path.join("actions", "index.ts"));
  requirePath(path.join("commands", "index.ts"));
  requirePath(path.join("contracts", "index.ts"));
  requirePath(path.join("data", "index.ts"));
  requirePath(path.join("schemas", "index.ts"));
  requirePath(path.join("policies", "index.ts"));
} else {
  for (const door of featurePublicDoorFiles) {
    const doorPath = path.join(featureSrcDir, door);
    if (!fs.existsSync(doorPath)) {
      problems.push(`Feature package missing public door: ${door}`);
    }
  }
}

const extraVerticalFolders = new Set(["surface", "surfaces", "tools", "workflows"]);

const unexpectedTopLevel = fs
  .readdirSync(sliceDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter(
    (name) =>
      !templateBuckets.has(name) &&
      !extraVerticalFolders.has(name) &&
      !featurePublicDoorFiles.includes(name as (typeof featurePublicDoorFiles)[number]),
  );

for (const name of unexpectedTopLevel) {
  problems.push(`Unexpected top-level folder in slice "${slice ?? feature}": ${name}`);
}

if (problems.length > 0) {
  console.error("[validate-feature-entry] Violations:");
  for (const problem of problems) {
    console.error(`- ${problem}`);
  }
  process.exit(1);
}

console.log(
  `[validate-feature-entry] OK: ${slice ? `${feature}/${slice}` : feature} entry points and buckets.`,
);
