/**
 * Four-layer @afenda/ui contract-drift audit (single-pass I/O).
 *
 * Run: pnpm audit:shadcn-primitives
 * Profile: pnpm audit:shadcn-primitives --profile
 */
import { runAllUiAudits } from "../audits/run-all.ts";
import { assertPathsExist, printViolations } from "../audits/shared.ts";

function parseArgs(argv: string[]): {
  strictVisual: boolean;
  warningsAsErrors: boolean;
  profile: boolean;
} {
  return {
    strictVisual: argv.includes("--strict-visual"),
    warningsAsErrors: argv.includes("--warnings-as-errors"),
    profile: argv.includes("--profile"),
  };
}

function main(): void {
  const { strictVisual, warningsAsErrors, profile } = parseArgs(process.argv.slice(2));
  assertPathsExist();

  console.log("@afenda/ui contract drift audit");
  console.log("=".repeat(40));
  console.log(
    "Doctrine: fork shadcn only for Afenda semantic tokens, a11y hardening, and enterprise density.",
  );

  const { layers } = runAllUiAudits({ strictVisual, profile });

  let totalErrors = 0;
  let totalWarnings = 0;

  for (const layer of layers) {
    if (profile && layer.violations.length === 0) {
      console.log(`\n${layer.title}`);
      console.log("-".repeat(40));
      console.log(`  ✓ ${layer.ms.toFixed(1)}ms`);
      continue;
    }
    const { errors, warnings } = printViolations(layer.title, layer.violations);
    totalErrors += errors;
    totalWarnings += warnings;
    if (profile) {
      console.log(`  (${layer.ms.toFixed(1)}ms)`);
    }
  }

  if (profile) {
    const totalMs = layers.reduce((sum, layer) => sum + layer.ms, 0);
    console.log(`\nTotal audit time: ${totalMs.toFixed(1)}ms (excludes tsx startup)`);
  }

  console.log("\n" + "=".repeat(40));
  if (totalErrors === 0 && (totalWarnings === 0 || !warningsAsErrors)) {
    console.log("Contract boundary holds.");
    if (totalWarnings > 0) {
      console.log(`${totalWarnings} warning(s) — review or run audit:shadcn-upstream:sync`);
    }
    console.log("Visual runtime gate: pnpm test:visual");
    return;
  }

  console.log(
    `\n${totalErrors} error(s), ${totalWarnings} warning(s). See packages/ui/shadcn-update.md`,
  );
  process.exit(1);
}

main();
