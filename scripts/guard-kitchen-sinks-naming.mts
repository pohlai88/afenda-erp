import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  KITCHEN_SINK_FAIL_BANNER,
  KITCHEN_SINK_ROLES,
  kitchenSinkNamingViolation,
} from "./lib/kitchen-sinks-naming.mts";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const kitchenSinksRoot = path.join(root, "apps/erp/src/kitchen-sinks");

const problems: string[] = [];

function checkGuard3() {
  if (!fs.existsSync(kitchenSinksRoot)) {
    problems.push("GUARD 3: apps/erp/src/kitchen-sinks/ is missing.");
    return;
  }

  for (const entry of fs.readdirSync(kitchenSinksRoot, { withFileTypes: true })) {
    const rel = `apps/erp/src/kitchen-sinks/${entry.name}`;

    if (entry.isDirectory()) {
      problems.push(`GUARD 3: kitchen-sinks/ must stay flat — remove ${rel}/`);
      continue;
    }

    if (!entry.isFile()) continue;

    const violation = kitchenSinkNamingViolation(entry.name);
    if (violation) {
      problems.push(`GUARD 3: ${violation}`);
    }
  }
}

checkGuard3();

if (problems.length > 0) {
  console.error("[guard:kitchen-sinks] GUARD 3 FAILED");
  console.error(KITCHEN_SINK_FAIL_BANNER);
  console.error("");
  for (const problem of problems) {
    console.error(`  - ${problem}`);
  }
  console.error("");
  console.error("Naming rule: kitchen-sinks/{topic}.{role}.ts");
  console.error(`  role = ${KITCHEN_SINK_ROLES.join(" | ")}`);
  console.error("  topic = kebab-case subject (cron, erp-http, auth-dev-sign-in)");
  console.error("  NO app- prefix. NO nested folders. NO random suffixes.");
  console.error("");
  console.error("Doc: .cursor/hooks/afenda-guard-kitchen-sinks.md");
  process.exit(1);
}

console.log(
  "[guard:kitchen-sinks] GUARD 3 passed — kitchen-sinks naming is valid.",
);
