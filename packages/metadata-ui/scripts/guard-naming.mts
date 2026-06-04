import path from "node:path";
import { fileURLToPath } from "node:url";

import { scanMetadataUiFromRoot } from "../../../scripts/lib/metadata-ui-layout.mts";

const packageRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const problems = scanMetadataUiFromRoot(packageRoot);

if (problems.length > 0) {
  console.error("[guard:metadata-ui] GUARD 6 FAILED");
  console.error("");
  console.error(`Violations: ${problems.length}`);
  console.error("");
  for (const problem of problems) {
    console.error(`  - ${problem}`);
  }
  console.error("");
  console.error("Checks: naming · doors · dependencies · registry · section contract");
  console.error("Doc: packages/metadata-ui/AGENTS.md");
  process.exit(1);
}

console.log(
  "[guard:metadata-ui] GUARD 6 passed — runtime · naming · doors · dependencies · registry · section contract",
);
