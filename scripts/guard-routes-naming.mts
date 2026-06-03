import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  ROUTES_FAIL_BANNER,
  routesNamingViolation,
} from "./lib/routes-naming.mts";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const routesRoot = path.join(root, "apps/erp/src/routes");

const problems: string[] = [];

function checkGuard4() {
  if (!fs.existsSync(routesRoot)) {
    problems.push("GUARD 4: apps/erp/src/routes/ is missing.");
    return;
  }

  for (const entry of fs.readdirSync(routesRoot, { withFileTypes: true })) {
    const rel = `apps/erp/src/routes/${entry.name}`;

    if (entry.isDirectory()) {
      problems.push(`GUARD 4: routes/ must stay flat — remove ${rel}/`);
      continue;
    }

    if (!entry.isFile()) continue;

    const violation = routesNamingViolation(entry.name);
    if (violation) {
      problems.push(`GUARD 4: ${violation}`);
    }
  }
}

checkGuard4();

if (problems.length > 0) {
  console.error("[guard:routes] GUARD 4 FAILED");
  console.error(ROUTES_FAIL_BANNER);
  console.error("");
  for (const problem of problems) {
    console.error(`  - ${problem}`);
  }
  console.error("");
  console.error("Naming rule: routes/{topic}-route.{artifact}.{ext}");
  console.error("  OR routes/route-{topic}.{artifact}.{ext}");
  console.error("  Every filename MUST contain -route or start with route-");
  console.error("  Flat folder only. No subdirectories.");
  console.error("");
  console.error("Doc: .cursor/hooks/afenda-guard-routes.md");
  process.exit(1);
}

console.log("[guard:routes] GUARD 4 passed — routes naming is valid.");
