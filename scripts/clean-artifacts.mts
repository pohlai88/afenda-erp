import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  ARTIFACTS_ROOT,
  VITEST_BLOB_REPORTS_LINK,
} from "./lib/artifacts-paths.mts";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const ignoredDirectoryNames = new Set([
  "node_modules",
  ".next",
  ".turbo",
  "dist",
  ".vercel",
]);

const removableDirectoryNames = new Set([
  "coverage",
  "test-results",
  "playwright-report",
  "blob-report",
]);

const removableFiles = new Set(["junit.xml"]);

function assertInsideRoot(target: string) {
  const resolvedRoot = path.resolve(root);
  const resolvedTarget = path.resolve(target);
  const relative = path.relative(resolvedRoot, resolvedTarget);

  if (
    relative === "" ||
    relative.startsWith("..") ||
    path.isAbsolute(relative)
  ) {
    throw new Error(`Refusing to remove path outside repository: ${target}`);
  }
}

function removePath(target: string) {
  if (
    !fs.existsSync(target) &&
    !fs.lstatSync(target, { throwIfNoEntry: false })
  ) {
    return;
  }

  assertInsideRoot(target);
  if (fs.lstatSync(target).isSymbolicLink()) {
    fs.unlinkSync(target);
    console.log(`[artifacts:clean] removed ${path.relative(root, target)}`);
    return;
  }

  fs.rmSync(target, { recursive: true, force: true });
  console.log(`[artifacts:clean] removed ${path.relative(root, target)}`);
}

function walk(dir: string) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (ignoredDirectoryNames.has(entry.name)) {
        continue;
      }

      if (removableDirectoryNames.has(entry.name)) {
        removePath(fullPath);
        continue;
      }

      walk(fullPath);
      continue;
    }

    if (entry.isFile() && removableFiles.has(entry.name)) {
      removePath(fullPath);
    }
  }
}

removePath(path.join(root, VITEST_BLOB_REPORTS_LINK));
removePath(path.join(root, ARTIFACTS_ROOT));
walk(root);

console.log("[artifacts:clean] artifact outputs removed");
