import fs from "node:fs";
import path from "node:path";
import {
  defaultTemplateBuckets,
  featurePublicDoorFiles,
  getRepositoryRoot,
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

const feature = args.get("--feature");
const slice = args.get("--slice");

if (!feature) {
  console.error(
    "[validate-feature-entry] Usage: validate-feature-entry.mts --feature <moduleId> [--slice <vertical>]",
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
const templateBuckets = new Set(readTemplateBuckets(root));

function requirePath(relativePath: string) {
  const fullPath = path.join(sliceDir, relativePath);
  if (!fs.existsSync(fullPath)) {
    problems.push(`Missing required entry file: ${relativePath}`);
  }
}

if (slice) {
  for (const bucket of defaultTemplateBuckets) {
    const bucketPath = path.join(sliceDir, bucket);
    if (!fs.existsSync(bucketPath)) {
      problems.push(`Vertical slice "${slice}" is missing bucket "${bucket}".`);
    }
  }

  requirePath("index.ts");
  requirePath(path.join("components", "index.ts"));
  requirePath(path.join("actions", "index.ts"));
  requirePath(path.join("contracts", "index.ts"));
  requirePath(path.join("data", "index.ts"));
  requirePath(path.join("schemas", "index.ts"));
  requirePath(path.join("policies", "index.ts"));

  const sliceIndexPath = path.join(sliceDir, "index.ts");
  if (fs.existsSync(sliceIndexPath)) {
    const sliceIndex = fs.readFileSync(sliceIndexPath, "utf8");
    if (!sliceIndex.includes("components")) {
      problems.push(`Slice index.ts must re-export components: ${slice}/index.ts`);
    }
    if (!sliceIndex.includes("actions")) {
      problems.push(`Slice index.ts must re-export actions: ${slice}/index.ts`);
    }
  }

  const metadataExemptSlices = new Set(["tenant-execution"]);
  const featureMetadataPath = path.join(featureSrcDir, "metadata.ts");
  if (fs.existsSync(featureMetadataPath) && !metadataExemptSlices.has(slice)) {
    const metadataSource = fs.readFileSync(featureMetadataPath, "utf8");
    if (!metadataSource.includes(`./${slice}/`)) {
      problems.push(
        `metadata.ts should export governed builders from the "${slice}" slice.`,
      );
    }
  }
} else {
  for (const door of featurePublicDoorFiles) {
    const doorPath = path.join(featureSrcDir, door);
    if (!fs.existsSync(doorPath)) {
      problems.push(`Feature package missing public door: ${door}`);
    }
  }
}

const unexpectedTopLevel = fs
  .readdirSync(sliceDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter(
    (name) =>
      !templateBuckets.has(name) &&
      name !== "surface" &&
      name !== "surfaces" &&
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
