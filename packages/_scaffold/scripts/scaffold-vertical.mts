import fs from "node:fs";
import path from "node:path";
import {
  createBucketPlaceholder,
  getRepositoryRoot,
  readFeatureTemplateBuckets,
  scaffoldRootRelativePath,
} from "./lib/scaffold-grammar.mts";
import { ensureDir, writeIfMissing } from "./lib/scaffold-io.mts";

const root = getRepositoryRoot();

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
      "Usage: pnpm scaffold:vertical <feature> <capability>\nExample: pnpm scaffold:vertical finance accounts-payable",
    );
  }

  if (!/^[a-z0-9-]+$/.test(featureName) || !/^[a-z0-9-]+$/.test(verticalName)) {
    throw new Error("Feature and capability names must be lowercase kebab-case.");
  }

  const featureDir = path.join(root, "packages/features", featureName);
  const featureBaseDir = resolveFeatureBaseDir(featureDir);
  if (!fs.existsSync(featureBaseDir)) {
    throw new Error(
      `Feature directory does not exist. Run pnpm scaffold:feature ${featureName} first.`,
    );
  }

  const verticalDir = path.join(featureBaseDir, verticalName);
  ensureDir(verticalDir);

  for (const bucket of readFeatureTemplateBuckets(root)) {
    const bucketDir = path.join(verticalDir, bucket);
    ensureDir(bucketDir);
    const placeholder = createBucketPlaceholder(bucket, `${scaffoldRootRelativePath}/feature`);
    if (placeholder) {
      writeIfMissing(path.join(bucketDir, "index.ts"), placeholder);
    }
  }

  writeIfMissing(
    path.join(verticalDir, "index.ts"),
    `/** Vertical slice public door — re-export through feature metadata/server as needed */\nexport {};\n`,
  );

  console.log(
    `[scaffold:vertical] ${featureName}/${verticalName} ready (${readFeatureTemplateBuckets(root).length} buckets · ${scaffoldRootRelativePath}/feature)`,
  );
}

main();
