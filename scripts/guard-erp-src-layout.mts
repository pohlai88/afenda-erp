import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const erpSrcRoot = path.join(root, "apps/erp/src");

const ALLOWED_TOP_LEVEL_DIRS = ["app", "kitchen-sinks", "routes"] as const;
const FLAT_TOP_LEVEL_DIRS = new Set<string>(["kitchen-sinks", "routes"]);
const ALLOWED_TOP_LEVEL_FILES = new Set(["instrumentation.ts", "proxy.ts"]);

const problems: string[] = [];

function relativeFromRoot(absolutePath: string) {
  return path.relative(root, absolutePath).replace(/\\/g, "/");
}

function checkGuard1() {
  if (!fs.existsSync(erpSrcRoot)) {
    problems.push("GUARD 1: apps/erp/src is missing.");
    return;
  }

  const entries = fs.readdirSync(erpSrcRoot, { withFileTypes: true });

  for (const dirName of ALLOWED_TOP_LEVEL_DIRS) {
    const dirPath = path.join(erpSrcRoot, dirName);
    if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
      problems.push(`GUARD 1: required directory apps/erp/src/${dirName}/ is missing.`);
    }
  }

  for (const entry of entries) {
    const rel = `apps/erp/src/${entry.name}`;

    if (entry.isDirectory()) {
      if (!ALLOWED_TOP_LEVEL_DIRS.includes(entry.name as (typeof ALLOWED_TOP_LEVEL_DIRS)[number])) {
        problems.push(
          `GUARD 1: forbidden top-level directory ${rel}/ — only app/, routes/, kitchen-sinks/ are allowed.`,
        );
      }
      continue;
    }

    if (entry.isFile() && !ALLOWED_TOP_LEVEL_FILES.has(entry.name)) {
      problems.push(
        `GUARD 1: forbidden top-level file ${rel} — move it into routes/ or kitchen-sinks/, or delete it.`,
      );
    }
  }

  for (const dirName of FLAT_TOP_LEVEL_DIRS) {
    const dirPath = path.join(erpSrcRoot, dirName);
    if (!fs.existsSync(dirPath)) continue;

    for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;

      problems.push(
        `GUARD 1: ${dirName}/ must stay flat — remove subdirectory ${dirName}/${entry.name}/ and move files to ${dirName}/.`,
      );
    }
  }
}

checkGuard1();

if (problems.length > 0) {
  console.error("[guard:erp-src] GUARD 1 failed — apps/erp/src layout violation:");
  for (const problem of problems) {
    console.error(`  - ${problem}`);
  }
  console.error("");
  console.error("Allowed layout:");
  console.error("  apps/erp/src/app/              Next.js App Router only");
  console.error("  apps/erp/src/routes/           flat route composers (*.server.tsx, etc.)");
  console.error("  apps/erp/src/kitchen-sinks/    flat misc ingress helpers");
  console.error("  apps/erp/src/instrumentation.ts");
  console.error("  apps/erp/src/proxy.ts");
  process.exit(1);
}

console.log("[guard:erp-src] GUARD 1 passed — apps/erp/src layout is valid.");
