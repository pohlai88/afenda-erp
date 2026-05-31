/**
 * Layer 2 — semantic token and typography contract drift in @afenda/ui.
 */
import {
  UI_PRIMITIVE_DESCRIPTION_DRIFT_PATTERN,
  buildRawPalettePattern,
} from "../src/design-system.color-contract.shared";
import type { AuditViolation } from "./shared";
import { FORBIDDEN_UI_PATTERNS, getPrimitiveContract } from "./primitive-contracts";
import type { UiSourceCache, UiSourceFile } from "./source-cache";

const DESCRIPTION_SLOT_NAMES =
  /function\s+(?:\w+Description|TableCaption|CommandEmpty|ComboboxEmpty|InputGroupText)\s*\(/;

const PALETTE_LINE_PATTERN = buildRawPalettePattern();
const DESCRIPTION_LINE_PATTERN = new RegExp(
  UI_PRIMITIVE_DESCRIPTION_DRIFT_PATTERN.source,
  UI_PRIMITIVE_DESCRIPTION_DRIFT_PATTERN.flags.includes("g")
    ? UI_PRIMITIVE_DESCRIPTION_DRIFT_PATTERN.flags
    : `${UI_PRIMITIVE_DESCRIPTION_DRIFT_PATTERN.flags}g`,
);

/** `allowedLinePatterns` must not use the `/g` flag — `.test()` is called per line. */
function lineIsSuppressed(line: string, allowedLinePatterns: RegExp[]): boolean {
  return allowedLinePatterns.some((pattern) => pattern.test(line));
}

/** Ends a description/helper primitive — not nested JSX expression braces. */
const DESCRIPTION_SLOT_END = /^\s*\}\s*;?\s*$/;

function auditLine(
  file: UiSourceFile,
  line: string,
  lineNo: number,
  slotState: { inDescriptionSlot: boolean },
): AuditViolation[] {
  const violations: AuditViolation[] = [];

  if (DESCRIPTION_SLOT_NAMES.test(line)) {
    slotState.inDescriptionSlot = true;
  }

  if (slotState.inDescriptionSlot) {
    if (
      !line.includes("uiTypography.muted") &&
      DESCRIPTION_LINE_PATTERN.test(line)
    ) {
      DESCRIPTION_LINE_PATTERN.lastIndex = 0;
      const match =
        DESCRIPTION_LINE_PATTERN.exec(line)?.[0] ?? "description drift";
      DESCRIPTION_LINE_PATTERN.lastIndex = 0;
      violations.push({
        layer: "token-drift",
        file: file.rel,
        line: lineNo,
        rule: "primitive-description-drift",
        match,
        hint: "Use uiTypography.muted (type-muted) in description/helper slots",
        severity: "error",
      });
    }

    if (DESCRIPTION_SLOT_END.test(line.trim())) {
      slotState.inDescriptionSlot = false;
    }
  }

  for (const paletteMatch of line.matchAll(PALETTE_LINE_PATTERN)) {
    violations.push({
      layer: "token-drift",
      file: file.rel,
      line: lineNo,
      rule: "no-raw-palette-in-ui",
      match: paletteMatch[0],
      hint: "Use semantic ERP tokens — never add slate/gray/zinc/neutral/stone to @afenda/ui",
      severity: "error",
    });
  }

  const allowedLinePatterns = getPrimitiveContract(file.fileName)?.allowedLinePatterns ?? [];
  if (!lineIsSuppressed(line, allowedLinePatterns)) {
    for (const entry of FORBIDDEN_UI_PATTERNS) {
      for (const match of line.matchAll(entry.linePattern)) {
        violations.push({
          layer: "token-drift",
          file: file.rel,
          line: lineNo,
          rule: entry.rule,
          match: match[0],
          hint: entry.hint,
          severity: entry.severity,
        });
      }
    }
  }

  return violations;
}

export function auditTokenDriftFromCache(cache: UiSourceCache): AuditViolation[] {
  const violations: AuditViolation[] = [];

  for (const file of cache.files) {
    const slotState = { inDescriptionSlot: false };
    for (let i = 0; i < file.lines.length; i++) {
      violations.push(...auditLine(file, file.lines[i]!, i + 1, slotState));
    }
  }

  return violations;
}
