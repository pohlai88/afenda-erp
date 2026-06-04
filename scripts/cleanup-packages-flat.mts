/**
 * Post-migration cleanup: remove legacy barrel dirs, flatten stragglers, relocate tests.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  FEATURES_CONTAINER,
  listPackageScanTargets,
  readTieredLayoutConfig,
  resolvePackageLayoutMode,
} from "./lib/packages-layout.mts";
import { featurePublicDoorFiles } from "../packages/_scaffold/scripts/lib/scaffold-grammar.mts";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const packagesRoot = path.join(root, "packages");
const DOORS = new Set<string>(featurePublicDoorFiles);

function rel(p: string) {
  return path.relative(root, p).split(path.sep).join("/");
}

function deleteIfBarrelOrEmpty(dir: string) {
  if (!fs.existsSync(dir)) return;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      deleteIfBarrelOrEmpty(path.join(dir, entry.name));
    }
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  if (entries.length === 0) {
    fs.rmdirSync(dir);
    return;
  }

  if (
    entries.length === 1 &&
    entries[0]!.isFile() &&
    entries[0]!.name === "index.ts"
  ) {
    fs.unlinkSync(path.join(dir, entries[0]!.name));
    fs.rmdirSync(dir);
  }
}

function flattenRemaining(flatDir: string) {
  let moved = true;
  while (moved) {
    moved = false;
    for (const entry of fs.readdirSync(flatDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      if (entry.name === "tests") continue;
      if (entry.name === FEATURES_CONTAINER) continue;

      const subDir = path.join(flatDir, entry.name);
      for (const file of fs.readdirSync(subDir, { withFileTypes: true })) {
        if (!file.isFile()) continue;
        if (file.name === "index.ts") continue;
        if (DOORS.has(file.name)) continue;

        const from = path.join(subDir, file.name);
        let target = path.join(flatDir, file.name);
        if (fs.existsSync(target)) {
          const ext = path.extname(file.name);
          const stem = file.name.slice(0, -ext.length);
          target = path.join(flatDir, `${stem}.${entry.name}${ext}`);
        }
        fs.renameSync(from, target);
        moved = true;
      }
      deleteIfBarrelOrEmpty(subDir);
    }
  }
}

function relocateTests(packageDir: string, srcRoot: string) {
  const testsDest = path.join(packageDir, "tests");
  fs.mkdirSync(testsDest, { recursive: true });

  function moveTestFile(from: string, hint: string) {
    const fileName = path.basename(from);
    let dest = path.join(testsDest, fileName);
    if (fs.existsSync(dest)) {
      const ext = path.extname(fileName);
      const stem = path.basename(fileName, ext);
      dest = path.join(testsDest, `${stem}.${hint}${ext}`);
    }
    fs.renameSync(from, dest);
  }

  function removeEmptyTree(dir: string) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) removeEmptyTree(path.join(dir, entry.name));
    }
    if (dir !== srcRoot && fs.readdirSync(dir).length === 0) {
      fs.rmdirSync(dir);
    }
  }

  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "tests" && dir !== srcRoot) {
          function walkTests(testDir: string, hint: string) {
            for (const testEntry of fs.readdirSync(testDir, { withFileTypes: true })) {
              const testPath = path.join(testDir, testEntry.name);
              if (testEntry.isDirectory()) {
                walkTests(testPath, testEntry.name);
                continue;
              }
              if (testEntry.isFile()) moveTestFile(testPath, hint);
            }
          }
          walkTests(full, path.basename(dir));
          removeEmptyTree(full);
          continue;
        }
        walk(full);
      }
    }
  }

  walk(srcRoot);
  removeEmptyTree(srcRoot);
}

function removeDuplicateArtifacts(srcRoot: string) {
  for (const entry of fs.readdirSync(srcRoot, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    if (!/\.(dup|alt\d*)[^/]*\.ts/.test(entry.name) && !entry.name.includes(".alt.")) {
      continue;
    }
    const dupPath = path.join(srcRoot, entry.name);
    const baseName = entry.name
      .replace(/\.dup(\.|\.)/, ".")
      .replace(/\.alt(\d+)?(\.|\.)/, ".")
      .replace(/\.alt\d+$/, "");
    const basePath = path.join(srcRoot, baseName);
    if (fs.existsSync(basePath)) {
      fs.unlinkSync(dupPath);
      console.log(`[cleanup] removed duplicate ${rel(dupPath)}`);
    }
  }
}

for (const target of listPackageScanTargets(packagesRoot)) {
  if (target.packageDirName === "ai") continue;

  console.log(`[cleanup] ${target.packageRel}`);
  const mode = resolvePackageLayoutMode(target);

  if (mode === "multi-feature") {
    const featuresRoot = path.join(target.srcRoot, FEATURES_CONTAINER);
    if (fs.existsSync(featuresRoot)) {
      for (const slice of fs.readdirSync(featuresRoot, { withFileTypes: true })) {
        if (!slice.isDirectory()) continue;
        flattenRemaining(path.join(featuresRoot, slice.name));
      }
    }
  } else if (mode === "tiered-feature") {
    const config = readTieredLayoutConfig(target);
    for (const domain of config.featureDomains) {
      const featureDir = path.join(target.srcRoot, domain);
      if (!fs.existsSync(featureDir)) continue;
      if (config.flatFeatureRoots.has(domain)) {
        flattenRemaining(featureDir);
        continue;
      }
      for (const sub of fs.readdirSync(featureDir, { withFileTypes: true })) {
        if (!sub.isDirectory()) continue;
        flattenRemaining(path.join(featureDir, sub.name));
      }
    }
  } else {
    flattenRemaining(target.srcRoot);
  }

  relocateTests(target.packageDir, target.srcRoot);
  removeDuplicateArtifacts(target.srcRoot);

  if (mode === "multi-feature") {
    const featuresRoot = path.join(target.srcRoot, FEATURES_CONTAINER);
    if (fs.existsSync(featuresRoot)) {
      for (const slice of fs.readdirSync(featuresRoot, { withFileTypes: true })) {
        if (slice.isDirectory()) deleteIfBarrelOrEmpty(path.join(featuresRoot, slice.name));
      }
    }
  } else if (mode === "tiered-feature") {
    const config = readTieredLayoutConfig(target);
    for (const domain of config.featureDomains) {
      const featureDir = path.join(target.srcRoot, domain);
      if (!fs.existsSync(featureDir)) continue;
      deleteIfBarrelOrEmpty(featureDir);
    }
  } else {
    deleteIfBarrelOrEmpty(target.srcRoot);
  }
}

console.log("[cleanup] complete");
