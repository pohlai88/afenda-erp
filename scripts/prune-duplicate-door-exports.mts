/**
 * Remove export * lines from package doors that cause TS2308 duplicate symbol errors.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const DOOR_FILES = [
  "packages/governed-surface/src/server.ts",
  "packages/governed-surface/src/client.ts",
  "packages/kernel/src/server.ts",
  "packages/kernel/src/index.ts",
  "packages/features/system-admin/src/server.ts",
  "packages/features/hr-suite/src/server.ts",
  "packages/features/lynx/src/server.ts",
];

const SKIP_EXPORT_PATTERNS = [
  /-schema["']/,
  /-schema\.schemas["']/,
  /-shared["']/,
  /-types["']/,
  /\.schema["']/,
  /-presentation["']/,
  /-copy-shared["']/,
  /ker-execution-audit-types["']/,
  /ker-execution-context-types["']/,
  /ker-execution-policy-types["']/,
];

for (const rel of DOOR_FILES) {
  const doorPath = path.join(root, rel);
  if (!fs.existsSync(doorPath)) continue;

  const lines = fs.readFileSync(doorPath, "utf8").split("\n");
  const filtered = lines.filter((line) => {
    if (!line.includes("export * from")) return true;
    return !SKIP_EXPORT_PATTERNS.some((pattern) => pattern.test(line));
  });

  if (filtered.length !== lines.length) {
    fs.writeFileSync(doorPath, filtered.join("\n"));
    console.log(
      `[prune-doors] ${rel}: removed ${lines.length - filtered.length} duplicate-prone exports`,
    );
  }
}

console.log("[prune-doors] complete");
