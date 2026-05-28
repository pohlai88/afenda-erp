import fs from "node:fs";
import path from "node:path";
import {
  createBucketPlaceholder,
  getRepositoryRoot,
  readTemplateBuckets,
} from "./lib/feature-bucket-grammar.mts";

const root = getRepositoryRoot();

function ensureDir(dirPath: string) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeIfMissing(filePath: string, content: string) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content, "utf8");
  }
}

function resolveFeatureBaseDir(featureDir: string) {
  const srcDir = path.join(featureDir, "src");
  if (fs.existsSync(path.join(srcDir, "index.ts"))) {
    return srcDir;
  }
  return featureDir;
}

function main() {
  const featureName = process.argv[2]?.trim();
  const verticalName = process.argv[3]?.trim();

  if (!featureName || !verticalName) {
    throw new Error(
      "Usage: pnpm scaffold:vertical <feature> <vertical>\nExample: pnpm scaffold:vertical finance gl",
    );
  }

  if (!/^[a-z0-9-]+$/.test(featureName) || !/^[a-z0-9-]+$/.test(verticalName)) {
    throw new Error("Feature and vertical names must be lowercase kebab-case.");
  }

  const featureDir = path.join(root, "packages/features", featureName);
  const featureBaseDir = resolveFeatureBaseDir(featureDir);
  if (!fs.existsSync(featureBaseDir)) {
    throw new Error(
      `Feature directory does not exist: ${path.relative(root, featureBaseDir)}`,
    );
  }

  const verticalDir = path.join(featureBaseDir, verticalName);
  ensureDir(verticalDir);

  for (const bucket of readTemplateBuckets(root)) {
    const bucketDir = path.join(verticalDir, bucket);
    ensureDir(bucketDir);
    const placeholder = createBucketPlaceholder(bucket);
    if (placeholder) {
      writeIfMissing(path.join(bucketDir, "index.ts"), placeholder);
    }
  }

  console.log(
    `[scaffold:vertical] ${featureName}/${verticalName} ready with ${readTemplateBuckets(root).length} template buckets`,
  );
}

main();
