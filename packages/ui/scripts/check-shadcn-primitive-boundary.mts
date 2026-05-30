/**
 * Guards @afenda/ui shadcn fork boundary — description slots and palette drift.
 *
 * Run: pnpm audit:shadcn-primitives
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import {
  UI_PRIMITIVE_DESCRIPTION_DRIFT_PATTERN,
  buildRawPalettePattern,
} from "../src/design-system.color-contract.shared.ts";

const packageRoot = join(fileURLToPath(import.meta.url), "..", "..");
const uiSrc = join(packageRoot, "src");
const repoRoot = join(packageRoot, "..", "..");

const DESCRIPTION_SLOT_NAMES =
  /function\s+(?:\w+Description|TableCaption|CommandEmpty|ComboboxEmpty|InputGroupText)\s*\(/;

type Violation = {
  file: string;
  line: number;
  rule: string;
  match: string;
  hint: string;
};

function walkFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...walkFiles(full));
    } else if (extname(entry) === ".tsx") {
      results.push(full);
    }
  }
  return results;
}

function relPosix(file: string): string {
  return relative(repoRoot, file).replace(/\\/g, "/");
}

function auditFile(filePath: string): Violation[] {
  const rel = relPosix(filePath);
  const content = readFileSync(filePath, "utf8");
  const lines = content.split("\n");
  const violations: Violation[] = [];
  const palettePattern = buildRawPalettePattern();

  let inDescriptionSlot = false;
  let descriptionDepth = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const lineNo = i + 1;

    if (DESCRIPTION_SLOT_NAMES.test(line)) {
      inDescriptionSlot = true;
      descriptionDepth = 0;
    }

    if (inDescriptionSlot) {
      descriptionDepth += (line.match(/{/g) ?? []).length;
      descriptionDepth -= (line.match(/}/g) ?? []).length;

      if (
        !line.includes("uiTypography.muted") &&
        UI_PRIMITIVE_DESCRIPTION_DRIFT_PATTERN.test(line)
      ) {
        UI_PRIMITIVE_DESCRIPTION_DRIFT_PATTERN.lastIndex = 0;
        const match = UI_PRIMITIVE_DESCRIPTION_DRIFT_PATTERN.exec(line)?.[0] ?? "description drift";
        UI_PRIMITIVE_DESCRIPTION_DRIFT_PATTERN.lastIndex = 0;
        violations.push({
          file: rel,
          line: lineNo,
          rule: "primitive-description-drift",
          match,
          hint: "Use uiTypography.muted (type-muted) in description/helper slots",
        });
      }

      if (descriptionDepth <= 0 && line.includes("}")) {
        inDescriptionSlot = false;
      }
    }

    palettePattern.lastIndex = 0;
    let paletteMatch: RegExpExecArray | null;
    while ((paletteMatch = palettePattern.exec(line)) !== null) {
      violations.push({
        file: rel,
        line: lineNo,
        rule: "no-raw-palette-in-ui",
        match: paletteMatch[0],
        hint: "Use semantic ERP tokens — never add slate/gray/zinc/neutral/stone to @afenda/ui",
      });
    }
  }

  return violations;
}

function main(): void {
  if (!existsSync(uiSrc)) {
    console.error(`Missing UI source: ${uiSrc}`);
    process.exit(1);
  }

  const violations: Violation[] = [];
  for (const file of walkFiles(uiSrc)) {
    violations.push(...auditFile(file));
  }

  console.log("Shadcn primitive boundary audit");
  console.log("=".repeat(40));

  if (violations.length === 0) {
    console.log("\nNo violations. Description slots and palette boundary hold.");
    return;
  }

  for (const v of violations) {
    console.log(`  ✗ ${v.file}:${v.line}  [${v.rule}]  ${v.match}`);
    console.log(`    → ${v.hint}`);
  }

  console.log(`\n${violations.length} violation(s). See packages/ui/shadcn-update.md`);
  process.exit(1);
}

main();
