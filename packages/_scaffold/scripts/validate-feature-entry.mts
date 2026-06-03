import fs from "node:fs";
import path from "node:path";
import {
  featureFlatFileViolation,
  featurePublicDoorFiles,
  getRepositoryRoot,
  isFeatureFlatFileName,
  isLegacyFeatureFolder,
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

function validateFlatDirectory(relativeLabel: string, dirPath: string, requireDoors: boolean) {
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const rel = `${relativeLabel}/${entry.name}`;

    if (entry.isDirectory()) {
      if (isLegacyFeatureFolder(entry.name)) {
        continue;
      }
      problems.push(`Flat layout forbids subdirectory: ${rel}/`);
      continue;
    }

    if (entry.name === "index.ts") continue;

    const violation = featureFlatFileViolation(entry.name);
    if (violation) {
      problems.push(`${relativeLabel}: ${violation}`);
    }
  }

  if (requireDoors) {
    for (const door of featurePublicDoorFiles) {
      if (!fs.existsSync(path.join(dirPath, door))) {
        problems.push(`Missing public door at feature root: ${door}`);
      }
    }
  } else if (!fs.existsSync(path.join(dirPath, "index.ts"))) {
    problems.push(`Vertical slice missing index.ts: ${relativeLabel}`);
  }
}

if (slice) {
  validateFlatDirectory(`${feature}/${slice}`, sliceDir, false);
} else {
  const topLevel = fs.readdirSync(featureSrcDir, { withFileTypes: true });
  const hasLegacyBuckets = topLevel.some(
    (entry) => entry.isDirectory() && isLegacyFeatureFolder(entry.name),
  );
  const hasVerticalSlices = topLevel.some(
    (entry) =>
      entry.isDirectory() &&
      !isLegacyFeatureFolder(entry.name) &&
      !featurePublicDoorFiles.includes(entry.name as (typeof featurePublicDoorFiles)[number]),
  );

  if (hasLegacyBuckets) {
    for (const door of featurePublicDoorFiles) {
      if (!fs.existsSync(path.join(featureSrcDir, door))) {
        problems.push(`Feature package missing public door: ${door}`);
      }
    }
  } else if (hasVerticalSlices) {
    for (const door of featurePublicDoorFiles) {
      if (!fs.existsSync(path.join(featureSrcDir, door))) {
        problems.push(`Feature package missing public door: ${door}`);
      }
    }

    for (const entry of topLevel) {
      if (!entry.isDirectory() || isLegacyFeatureFolder(entry.name)) continue;
      validateFlatDirectory(`${feature}/${entry.name}`, path.join(featureSrcDir, entry.name), false);
    }

    for (const entry of topLevel) {
      if (!entry.isFile()) continue;
      if (featurePublicDoorFiles.includes(entry.name as (typeof featurePublicDoorFiles)[number])) {
        continue;
      }
      const violation = featureFlatFileViolation(entry.name);
      if (violation) {
        problems.push(`feature root: ${violation}`);
      }
    }
  } else {
    validateFlatDirectory(feature, featureSrcDir, true);
  }
}

if (problems.length > 0) {
  console.error("[validate-feature-entry] Violations:");
  for (const problem of problems) {
    console.error(`- ${problem}`);
  }
  process.exit(1);
}

console.log(
  `[validate-feature-entry] OK: ${slice ? `${feature}/${slice}` : feature} flat entry layout.`,
);
