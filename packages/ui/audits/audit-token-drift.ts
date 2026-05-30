/**
 * Layer 2 — semantic token and typography contract drift in @afenda/ui.
 */
import {
  UI_PRIMITIVE_DESCRIPTION_DRIFT_PATTERN,
  buildRawPalettePattern,
} from "../src/design-system.color-contract.shared.ts";
import type { AuditViolation } from "./shared.ts";
import {
  ALLOWED_RAW_CLASSES,
  FORBIDDEN_UI_PATTERNS,
  getPrimitiveContract,
} from "./primitive-contracts.ts";
import type { UiSourceCache, UiSourceFile } from "./source-cache.ts";

const DESCRIPTION_SLOT_NAMES =
  /function\s+(?:\w+Description|TableCaption|CommandEmpty|ComboboxEmpty|InputGroupText)\s*\(/;

const PALETTE_LINE_PATTERN = buildRawPalettePattern();
const DESCRIPTION_LINE_PATTERN = new RegExp(
  UI_PRIMITIVE_DESCRIPTION_DRIFT_PATTERN.source,
  UI_PRIMITIVE_DESCRIPTION_DRIFT_PATTERN.flags.includes("g")
    ? UI_PRIMITIVE_DESCRIPTION_DRIFT_PATTERN.flags
    : `${UI_PRIMITIVE_DESCRIPTION_DRIFT_PATTERN.flags}g`,
);

function lineHasAllowedRawClass(line: string): boolean {
  for (const token of ALLOWED_RAW_CLASSES) {
    if (line.includes(token)) return true;
  }
  return false;
}

function lineIsSuppressed(line: string, allowedLinePatterns: RegExp[]): boolean {
  return allowedLinePatterns.some((pattern) => pattern.test(line));
}

function auditDescriptionSlots(file: UiSourceFile): AuditViolation[] {
  const violations: AuditViolation[] = [];
  let inDescriptionSlot = false;
  let descriptionDepth = 0;

  for (let i = 0; i < file.lines.length; i++) {
    const line = file.lines[i]!;
    const lineNo = i + 1;

    if (DESCRIPTION_SLOT_NAMES.test(line)) {
      inDescriptionSlot = true;
      descriptionDepth = 0;
    }

    if (!inDescriptionSlot) continue;

    descriptionDepth += (line.match(/{/g) ?? []).length;
    descriptionDepth -= (line.match(/}/g) ?? []).length;

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

    if (descriptionDepth <= 0 && line.includes("}")) {
      inDescriptionSlot = false;
    }
  }

  return violations;
}

function auditPalette(file: UiSourceFile): AuditViolation[] {
  const violations: AuditViolation[] = [];

  for (let i = 0; i < file.lines.length; i++) {
    const line = file.lines[i]!;
    const lineNo = i + 1;
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
  }

  return violations;
}

function auditForbiddenVisualTokens(file: UiSourceFile): AuditViolation[] {
  const contract = getPrimitiveContract(file.fileName);
  const allowedLinePatterns = contract?.allowedLinePatterns ?? [];
  const violations: AuditViolation[] = [];

  for (let i = 0; i < file.lines.length; i++) {
    const line = file.lines[i]!;
    const lineNo = i + 1;

    if (lineIsSuppressed(line, allowedLinePatterns)) continue;

    for (const entry of FORBIDDEN_UI_PATTERNS) {
      for (const match of line.matchAll(entry.linePattern)) {
        if (entry.rule === "no-inline-style" && file.fileName === "progress.tsx") continue;
        if (lineHasAllowedRawClass(line) && entry.severity === "warn") continue;

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
    violations.push(...auditDescriptionSlots(file));
    violations.push(...auditPalette(file));
    violations.push(...auditForbiddenVisualTokens(file));
  }
  return violations;
}
