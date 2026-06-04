/**
 * Flatten all package src trees to GUARD 5 layout (single | multi | tiered).
 *
 * Usage:
 *   tsx scripts/migrate-packages-flat.mts [--dry-run] [--package=lynx]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  FEATURES_CONTAINER,
  HR_TIERED_FLAT_FILE,
  LEGACY_BUCKET_DIRS,
  type PackageScanTarget,
  flatFilePatternForCode,
  listPackageScanTargets,
  packageSrcCode,
  readTieredLayoutConfig,
  resolvePackageLayoutMode,
} from "./lib/packages-layout.mts";
import { featurePublicDoorFiles } from "../packages/_scaffold/scripts/lib/scaffold-grammar.mts";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const packagesRoot = path.join(root, "packages");

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const packageFilter = args
  .find((a) => a.startsWith("--package="))
  ?.slice("--package=".length);

const SKIP_DIRS = new Set(["tests", "node_modules", ".turbo"]);
const SKIP_FILES = new Set(["index.ts"]);
const DOOR_SET = new Set<string>(featurePublicDoorFiles);

type Move = { from: string; to: string; relFrom: string; relTo: string };
type SliceMove = { from: string; to: string; relFrom: string; relTo: string };

const moves: Move[] = [];
const sliceMoves: SliceMove[] = [];
const plannedTargets = new Set<string>();
const manifestPath = path.join(root, ".artifacts", "migrate-packages-flat.json");

function rel(p: string) {
  return path.relative(root, p).split(path.sep).join("/");
}

function ensureDir(dir: string) {
  if (!dryRun) fs.mkdirSync(dir, { recursive: true });
}

function safeRename(from: string, to: string) {
  if (dryRun) return;
  ensureDir(path.dirname(to));
  try {
    fs.renameSync(from, to);
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code !== "EPERM" && err.code !== "EXDEV") throw error;
    fs.cpSync(from, to, { recursive: true });
    fs.rmSync(from, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  }
}

function migrateBasename(
  fileName: string,
  code: string,
  packageDirName: string,
): string {
  if (DOOR_SET.has(fileName) || fileName.endsWith(".md") || fileName === ".gitkeep") {
    return fileName;
  }
  if (!/\.(ts|tsx)$/.test(fileName)) {
    return fileName;
  }
  if (flatFilePatternForCode(code).test(fileName)) return fileName;
  if (HR_TIERED_FLAT_FILE.test(fileName)) return fileName;

  const escaped = packageDirName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const dotPrefix = new RegExp(`^${escaped}\\.`);
  if (dotPrefix.test(fileName)) {
    return fileName.replace(dotPrefix, `${code}-`);
  }

  if (packageDirName === "db") {
    if (/^(?:hr-|db-|dbx-)/.test(fileName)) return fileName;
    if (/\.(ts|tsx)$/.test(fileName) && !fileName.includes(".")) {
      return `dbx-${fileName.replace(/\.tsx?$/, "")}.schema.ts`;
    }
    const base = fileName.replace(/\.tsx?$/, "");
    if (!base.startsWith(`${code}-`)) return `dbx-${base}.ts`;
  }

  if (!fileName.startsWith(`${code}-`) && /\.(ts|tsx)$/.test(fileName)) {
    const ext = path.extname(fileName);
    const stem = fileName.slice(0, -ext.length);
    if (stem.includes(".")) return `${code}-${stem.replace(/\./g, "-")}${ext}`;
    return `${code}-${stem}${ext}`;
  }

  return fileName;
}

function uniqueTargetPath(flatDir: string, basename: string, sourceRel: string) {
  let target = path.join(flatDir, basename);
  if (!fs.existsSync(target) || path.resolve(target) === path.resolve(sourceRel)) {
    return target;
  }
  const ext = path.extname(basename);
  const stem = basename.slice(0, -ext.length);
  const bucket = sourceRel.split("/").find((s) => LEGACY_BUCKET_DIRS.has(s)) ?? "dup";
  return path.join(flatDir, `${stem}.${bucket}${ext}`);
}

function collectFlattenMoves(
  flatDir: string,
  code: string,
  packageDirName: string,
  walkRoot?: string,
) {
  const scanRoot = walkRoot && fs.existsSync(walkRoot) ? walkRoot : flatDir;
  if (!fs.existsSync(scanRoot)) return;

  const pending: Array<{ source: string; targetBasename: string }> = [];

  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name)) continue;
        walk(full);
        continue;
      }
      if (!entry.isFile()) continue;
      if (SKIP_FILES.has(entry.name) && path.dirname(full) !== scanRoot) continue;
      if (path.dirname(full) === scanRoot) continue;

      const basename = migrateBasename(entry.name, code, packageDirName);
      pending.push({ source: full, targetBasename: basename });
    }
  }

  walk(scanRoot);

  for (const item of pending) {
    let target = uniqueTargetPath(
      flatDir,
      item.targetBasename,
      rel(item.source),
    );
    if (path.resolve(item.source) === path.resolve(target)) continue;

    const targetKey = path.resolve(target);
    if (plannedTargets.has(targetKey)) {
      const ext = path.extname(item.targetBasename);
      const stem = item.targetBasename.slice(0, -ext.length);
      const bucket =
        rel(item.source).split("/").find((s) => LEGACY_BUCKET_DIRS.has(s)) ?? "alt";
      target = path.join(flatDir, `${stem}.${bucket}${ext}`);
    }
    plannedTargets.add(path.resolve(target));

    moves.push({
      from: item.source,
      to: target,
      relFrom: rel(item.source),
      relTo: rel(target),
    });
  }
}

function removeEmptyDirs(dir: string) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      const child = path.join(dir, entry.name);
      removeEmptyDirs(child);
      if (fs.readdirSync(child).length === 0 && !dryRun) {
        fs.rmdirSync(child);
      }
    }
  }
}

function applySliceMoves() {
  for (const move of sliceMoves) {
    if (dryRun) {
      console.log(`[dry-run] slice ${move.relFrom} -> ${move.relTo}`);
      continue;
    }
    if (fs.existsSync(move.to)) continue;
    ensureDir(path.dirname(move.to));
    safeRename(move.from, move.to);
  }
}

function applyMoves() {
  ensureDir(path.dirname(manifestPath));
  applySliceMoves();
  const sorted = [...moves].sort(
    (a, b) => b.from.split(path.sep).length - a.from.split(path.sep).length,
  );
  for (const move of sorted) {
    if (dryRun) {
      console.log(`[dry-run] ${move.relFrom} -> ${move.relTo}`);
      continue;
    }
    ensureDir(path.dirname(move.to));
    if (!fs.existsSync(move.from)) continue;

    let dest = move.to;
    if (fs.existsSync(dest)) {
      const ext = path.extname(dest);
      const stem = dest.slice(0, -ext.length);
      let i = 2;
      while (fs.existsSync(dest)) {
        dest = `${stem}.alt${i}${ext}`;
        i++;
      }
      move.to = dest;
      move.relTo = rel(dest);
    }

    safeRename(move.from, move.to);
  }
  if (!dryRun) {
    fs.writeFileSync(manifestPath, JSON.stringify(sorted, null, 2));
  }
}

function migrateSingleFeature(target: PackageScanTarget) {
  collectFlattenMoves(
    target.srcRoot,
    packageSrcCode(target.packageDirName),
    target.packageDirName,
  );
}

function migrateMultiFeature(target: PackageScanTarget) {
  const srcRel = `${target.packageRel}/src`;
  const featuresRoot = path.join(target.srcRoot, FEATURES_CONTAINER);

  for (const entry of fs.readdirSync(target.srcRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (entry.name === FEATURES_CONTAINER) continue;
    if (LEGACY_BUCKET_DIRS.has(entry.name)) continue;

    const sliceSrc = path.join(target.srcRoot, entry.name);
    const sliceDest = path.join(featuresRoot, entry.name);

    if (!fs.existsSync(sliceDest)) {
      sliceMoves.push({
        from: sliceSrc,
        to: sliceDest,
        relFrom: `${srcRel}/${entry.name}`,
        relTo: `${srcRel}/features/${entry.name}`,
      });
    }

    collectFlattenMoves(
      sliceDest,
      packageSrcCode(target.packageDirName),
      target.packageDirName,
      sliceSrc,
    );
  }

  if (fs.existsSync(featuresRoot)) {
    for (const entry of fs.readdirSync(featuresRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      collectFlattenMoves(
        path.join(featuresRoot, entry.name),
        packageSrcCode(target.packageDirName),
        target.packageDirName,
      );
    }
  }
}

function migrateTieredFeature(target: PackageScanTarget) {
  const config = readTieredLayoutConfig(target);
  const code = packageSrcCode(target.packageDirName);

  for (const entry of fs.readdirSync(target.srcRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (!config.featureDomains.includes(entry.name)) continue;

    const featureDir = path.join(target.srcRoot, entry.name);
    if (config.flatFeatureRoots.has(entry.name)) {
      collectFlattenMoves(featureDir, code, target.packageDirName);
      continue;
    }

    for (const sub of fs.readdirSync(featureDir, { withFileTypes: true })) {
      if (!sub.isDirectory()) continue;
      const subDir = path.join(featureDir, sub.name);
      collectFlattenMoves(subDir, code, target.packageDirName);
    }
  }
}


function migratePackage(target: PackageScanTarget) {
  const mode = resolvePackageLayoutMode(target);
  console.log(`\n[migrate] ${target.packageRel} (${mode})`);

  if (target.packageDirName === "object-storage") {
    migrateTieredFeature(target);
    return;
  }

  switch (mode) {
    case "tiered-feature":
      migrateTieredFeature(target);
      break;
    case "multi-feature":
      migrateMultiFeature(target);
      break;
    default:
      migrateSingleFeature(target);
  }
}

const targets = listPackageScanTargets(packagesRoot).filter(
  (t) => t.packageDirName !== "ai" && (!packageFilter || t.packageDirName === packageFilter),
);

for (const target of targets) {
  migratePackage(target);
}

console.log(`\n[migrate] planned moves: ${moves.length} (+ ${sliceMoves.length} slice dirs)`);
applyMoves();
if (!dryRun) {
  for (const target of targets) {
    removeEmptyDirs(target.srcRoot);
    const featuresRoot = path.join(target.srcRoot, FEATURES_CONTAINER);
    if (fs.existsSync(featuresRoot)) {
      for (const entry of fs.readdirSync(featuresRoot, { withFileTypes: true })) {
        if (entry.isDirectory()) removeEmptyDirs(path.join(featuresRoot, entry.name));
      }
    }
    const mode = resolvePackageLayoutMode(target);
    if (mode === "tiered-feature") {
      const config = readTieredLayoutConfig(target);
      for (const domain of config.featureDomains) {
        const featureDir = path.join(target.srcRoot, domain);
        if (!fs.existsSync(featureDir)) continue;
        if (config.flatFeatureRoots.has(domain)) {
          removeEmptyDirs(featureDir);
          continue;
        }
        for (const sub of fs.readdirSync(featureDir, { withFileTypes: true })) {
          if (sub.isDirectory()) removeEmptyDirs(path.join(featureDir, sub.name));
        }
      }
    }
  }
}
console.log(dryRun ? "[migrate] dry-run complete" : `[migrate] applied ${moves.length} moves`);
