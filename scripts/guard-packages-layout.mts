import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  PACKAGES_LAYOUT_FAIL_BANNER,
  listPackageScanTargets,
  scanPackageJsonExports,
  scanPackageSrc,
} from "./lib/packages-layout.mts";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const packagesRoot = path.join(root, "packages");

const problems: string[] = [];
const scanned: string[] = [];

function checkGuard5() {
  if (!fs.existsSync(packagesRoot)) {
    problems.push("GUARD 5: packages/ is missing.");
    return;
  }

  for (const target of listPackageScanTargets(packagesRoot)) {
    const mode = scanPackageSrc(target, problems);
    scanPackageJsonExports(target.packageDir, target.packageRel, problems);
    scanned.push(`${target.packageRel} [${mode}]`);
  }
}

checkGuard5();

if (problems.length > 0) {
  console.error("[guard:packages] GUARD 5 FAILED");
  console.error(PACKAGES_LAYOUT_FAIL_BANNER);
  console.error("");
  console.error(`Scanned ${scanned.length} packages:`);
  for (const line of scanned) {
    console.error(`  · ${line}`);
  }
  console.error(`Violations: ${problems.length}`);
  console.error("");
  for (const problem of problems.slice(0, 50)) {
    console.error(`  - ${problem}`);
  }
  if (problems.length > 50) {
    console.error(`  ... and ${problems.length - 50} more`);
  }
  console.error("");
  console.error("Rules:");
  console.error("  single-feature  → src/ flat");
  console.error("  multi-feature   → src/features/<slice>/ flat");
  console.error("  tiered-feature  → src/<feature>/<sub-feature>/ flat (HR Suite)");
  console.error("Doc: .cursor/hooks/afenda-guard-packages-layout.md");
  process.exit(1);
}

console.log(`[guard:packages] GUARD 5 passed — ${scanned.length} packages:`);
for (const line of scanned) {
  console.log(`  · ${line}`);
}
