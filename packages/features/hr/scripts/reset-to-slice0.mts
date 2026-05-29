/**
 * Removes pre-filled HR vertical scaffolding (failed big-bang pattern).
 * Run: pnpm exec tsx packages/features/hr/scripts/reset-to-slice0.mts
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const srcDir = path.join(packageRoot, "src");

const keepRootFiles = new Set([
  "index.ts",
  "client.ts",
  "server.ts",
  "metadata.ts",
]);

const keepRootDirs = new Set(["contracts", "metadata", "workforce"]);

function removePath(target: string) {
  if (!fs.existsSync(target)) return;
  fs.rmSync(target, { recursive: true, force: true });
  console.log(`[reset-to-slice0] removed ${path.relative(packageRoot, target)}`);
}

for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
  const target = path.join(srcDir, entry.name);
  if (entry.isDirectory()) {
    if (!keepRootDirs.has(entry.name)) {
      removePath(target);
    }
    continue;
  }
  if (!keepRootFiles.has(entry.name)) {
    removePath(target);
  }
}

for (const dir of keepRootDirs) {
  const dirPath = path.join(srcDir, dir);
  if (!fs.existsSync(dirPath)) continue;
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const target = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      removePath(target);
    }
  }
}

console.log("[reset-to-slice0] baseline ready — add Slice 0 files if missing.");
