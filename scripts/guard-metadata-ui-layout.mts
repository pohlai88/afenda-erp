import path from "node:path";
import { fileURLToPath } from "node:url";

import { scanMetadataUiFromRoot } from "./lib/metadata-ui-layout.mts";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageRoot = path.join(root, "packages", "metadata-ui");

const problems = scanMetadataUiFromRoot(packageRoot);

if (problems.length > 0) {
  console.error("[guard:metadata-ui] GUARD 6 FAILED");
  console.error("");
  console.error("Checks: runtime · naming · doors · dependencies · registry · section contract");
  console.error("");
  for (const problem of problems) {
    console.error(`  - ${problem}`);
  }
  console.error("");
  console.error("Doc: packages/metadata-ui/AGENTS.md");
  process.exit(1);
}

console.log(
  "[guard:metadata-ui] GUARD 6 passed — runtime · naming · doors · dependencies · registry · section contract",
);
