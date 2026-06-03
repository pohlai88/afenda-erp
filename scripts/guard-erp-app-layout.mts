import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const appRoot = path.join(root, "apps/erp/src/app");

const FAIL_BANNER = "FUCK, READ the RULES!!";

const ALLOWED_TOP_LEVEL_DIRS = [
  "(auth)",
  "(workspace)",
  "api",
  "onboarding",
] as const;

const ALLOWED_TOP_LEVEL_FILES = new Set([
  "default.tsx",
  "error.tsx",
  "favicon.ico",
  "forbidden.tsx",
  "global-error.tsx",
  "globals.css",
  "layout.tsx",
  "loading.tsx",
  "not-found.tsx",
  "page.tsx",
  "template.tsx",
  "unauthorized.tsx",
]);

const problems: string[] = [];

function checkGuard2() {
  if (!fs.existsSync(appRoot)) {
    problems.push("GUARD 2: apps/erp/src/app/ is missing.");
    return;
  }

  for (const dirName of ALLOWED_TOP_LEVEL_DIRS) {
    const dirPath = path.join(appRoot, dirName);
    if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
      problems.push(
        `GUARD 2: required directory apps/erp/src/app/${dirName}/ is missing.`,
      );
    }
  }

  for (const entry of fs.readdirSync(appRoot, { withFileTypes: true })) {
    const rel = `apps/erp/src/app/${entry.name}`;

    if (entry.isDirectory()) {
      if (
        !ALLOWED_TOP_LEVEL_DIRS.includes(
          entry.name as (typeof ALLOWED_TOP_LEVEL_DIRS)[number],
        )
      ) {
        problems.push(
          `GUARD 2: forbidden top-level directory ${rel}/ — only (auth)/, (workspace)/, api/, onboarding/ are allowed.`,
        );
      }
      continue;
    }

    if (entry.isFile() && !ALLOWED_TOP_LEVEL_FILES.has(entry.name)) {
      problems.push(
        `GUARD 2: forbidden top-level file ${rel} — only Next.js root route files (page.tsx, layout.tsx, error.tsx, not-found.tsx, global-error.tsx, globals.css, favicon.ico, etc.) are allowed at app root.`,
      );
    }
  }
}

checkGuard2();

if (problems.length > 0) {
  console.error("[guard:erp-app] GUARD 2 FAILED");
  console.error(FAIL_BANNER);
  console.error("");
  for (const problem of problems) {
    console.error(`  - ${problem}`);
  }
  console.error("");
  console.error("Allowed top-level under apps/erp/src/app/:");
  console.error("  (auth)/");
  console.error("  (workspace)/");
  console.error("  api/");
  console.error("  onboarding/");
  console.error("  page.tsx, layout.tsx, loading.tsx, error.tsx, global-error.tsx");
  console.error("  not-found.tsx, template.tsx, default.tsx, forbidden.tsx, unauthorized.tsx");
  console.error("  globals.css, favicon.ico");
  console.error("");
  console.error("Everything else → routes/ or kitchen-sinks/. See .cursor/hooks/afenda-guard-erp-app.md");
  process.exit(1);
}

console.log("[guard:erp-app] GUARD 2 passed — apps/erp/src/app layout is valid.");
