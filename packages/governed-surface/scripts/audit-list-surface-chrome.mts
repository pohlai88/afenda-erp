/**
 * List surface toolbar/footer chrome audit.
 *
 * Catches misaligned list controls and unpadded pagination footers that
 * audit:shadcn-composition and audit:skeleton-parity do not detect.
 *
 * Run:
 *   pnpm audit:list-surface-chrome
 *   pnpm audit:list-surface-chrome --strict
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

type Severity = "error" | "warning";

type Violation = {
  file: string;
  line: number;
  ruleId: string;
  message: string;
  severity: Severity;
};

const packageRoot = join(fileURLToPath(import.meta.url), "..", "..");
const repoRoot = join(packageRoot, "..", "..");

const TARGETS = [
  {
    rel: "packages/governed-surface/src/metadata/renderers/list-surface-toolbar.client.tsx",
    rules: [
      {
        id: "toolbar-orphan-margin",
        severity: "error" as const,
        test: (source: string) => /\bmb-density-/.test(source),
        message:
          "List toolbar must not use mb-density-* — chrome row owns vertical spacing",
      },
      {
        id: "toolbar-full-width-row",
        severity: "error" as const,
        test: (source: string) =>
          /data-testid="governed-list-toolbar"/.test(source) &&
          !/shrink-0/.test(source),
        message:
          "List toolbar root must be shrink-0; parent chrome row owns w-full justify-between",
      },
    ],
  },
  {
    rel: "packages/governed-surface/src/metadata/renderers/list-surface-table.client.tsx",
    rules: [
      {
        id: "list-chrome-shared-import",
        severity: "error" as const,
        test: (source: string) =>
          !source.includes("list-surface-chrome.shared"),
        message:
          "List table shell must import shared chrome classes from list-surface-chrome.shared.ts",
      },
      {
        id: "list-chrome-density-inset",
        severity: "error" as const,
        test: (source: string) =>
          !source.includes("listSurfaceChromeXClass") ||
          source.includes("LIST_SURFACE_CHROME_X_CLASS"),
        message:
          "List table shell must use listSurfaceChromeXClass(density), not LIST_SURFACE_CHROME_X_CLASS",
      },
      {
        id: "list-table-only-card-chrome",
        severity: "error" as const,
        test: (source: string) =>
          /presentationVariant === "table-only"/.test(source) &&
          !source.includes("LIST_SURFACE_CARD_CHROME_CLASS"),
        message:
          'table-only lists must wrap in LIST_SURFACE_CARD_CHROME_CLASS bordered card',
      },
    ],
  },
  {
    rel: "packages/governed-surface/src/metadata/renderers/list-surface-chrome.shared.ts",
    rules: [
      {
        id: "list-chrome-x-token",
        severity: "error" as const,
        test: (source: string) =>
          !source.includes("--af-table-cell-px"),
        message:
          "List chrome horizontal inset must align to --af-table-cell-px",
      },
    ],
  },
];

function audit(): Violation[] {
  const violations: Violation[] = [];

  for (const target of TARGETS) {
    const filePath = join(repoRoot, target.rel);
    if (!existsSync(filePath)) {
      violations.push({
        file: target.rel,
        line: 1,
        ruleId: "missing-file",
        message: `Expected file missing: ${target.rel}`,
        severity: "error",
      });
      continue;
    }

    const source = readFileSync(filePath, "utf8");
    for (const rule of target.rules) {
      if (rule.test(source)) {
        violations.push({
          file: target.rel,
          line: 1,
          ruleId: rule.id,
          message: rule.message,
          severity: rule.severity,
        });
      }
    }
  }

  return violations;
}

function main(): void {
  const strict = process.argv.includes("--strict");
  const violations = audit();

  console.log("List surface chrome audit");
  console.log("=".repeat(50));

  if (violations.length === 0) {
    console.log("No list toolbar/footer chrome violations found.");
    return;
  }

  for (const v of violations) {
    console.log(
      `[${v.severity.padEnd(7)}]  ${v.file}:${v.line}  [${v.ruleId}]  ${v.message}`,
    );
  }

  const errorCount = violations.filter((v) => v.severity === "error").length;
  console.log();
  console.log(`Total: ${violations.length} (${errorCount} errors)`);

  if (strict && errorCount > 0) {
    process.exit(1);
  }
}

main();
