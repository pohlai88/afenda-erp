/**
 * Per-primitive contract manifests for @afenda/ui.
 *
 * Export doors come from `.upstream/shadcn/manifest.json` (single source of truth).
 * Pattern rules live here as representative structure checks — not subjective design.
 */
import { manifestExportMap } from "./load-manifest.ts";

export type PrimitiveContract = {
  file: string;
  exports: string[];
  requiredPatterns: RegExp[];
  allowedLinePatterns: RegExp[];
  skipUpstream?: boolean;
};

const OVERLAY_ALLOWED: RegExp[] = [
  /shadow-(?:lg|xl|2xl)/,
  /rounded-(?:2xl|xl|lg|md)/,
];

/** Afenda-only surfaces — not in upstream shadcn manifest. */
const AFENDA_ONLY_EXPORTS: Record<string, string[]> = {
  "erp-shell.tsx": ["ShellFrame"],
};

export const ALLOWED_RAW_CLASSES = new Set([
  "sr-only",
  "pointer-events-none",
  "absolute",
  "relative",
  "fixed",
  "sticky",
  "flex",
  "grid",
  "inline-flex",
  "hidden",
  "block",
  "contents",
]);

export const FORBIDDEN_UI_PATTERNS: Array<{
  pattern: RegExp;
  rule: string;
  hint: string;
  severity: "error" | "warn";
  linePattern: RegExp;
}> = [
  {
    pattern: /style=\{\{/,
    rule: "no-inline-style",
    hint: "Use semantic tokens and Tailwind utilities — inline style is contract drift",
    severity: "error",
    linePattern: /style=\{\{/g,
  },
  {
    pattern: /#[0-9a-fA-F]{3,8}\b/,
    rule: "no-raw-hex-color",
    hint: "Use semantic color tokens — never hard-code hex in primitives",
    severity: "error",
    linePattern: /#[0-9a-fA-F]{3,8}\b/g,
  },
  {
    pattern: /\b(?:rgb|rgba|hsl)\(/,
    rule: "no-raw-color-function",
    hint: "Use semantic color tokens — never hard-code rgb/hsl in primitives",
    severity: "error",
    linePattern: /\b(?:rgb|rgba|hsl)\(/g,
  },
  {
    pattern: /\bbg-white\b|\btext-black\b|\bborder-gray\b/,
    rule: "no-raw-neutral-surface",
    hint: "Use bg-background, text-foreground, border-border — not raw neutrals",
    severity: "error",
    linePattern: /\bbg-white\b|\btext-black\b|\bborder-gray\b/g,
  },
  {
    pattern: /\bshadow-(?:lg|xl|2xl)\b/,
    rule: "no-raw-elevation-shadow",
    hint: "Use shadow-elevation-* tokens when migrating overlay surfaces",
    severity: "warn",
    linePattern: /\bshadow-(?:lg|xl|2xl)\b/g,
  },
  {
    pattern: /\brounded-(?:sm|md|lg|xl|2xl|3xl)\b/,
    rule: "no-raw-radius",
    hint: "Use rounded-control, rounded-section, rounded-card, rounded-panel",
    severity: "warn",
    linePattern: /\brounded-(?:sm|md|lg|xl|2xl|3xl)\b/g,
  },
];

const CVA_FILES = new Set([
  "badge.tsx",
  "button-group.tsx",
  "button.tsx",
  "navigation-menu.tsx",
  "tabs.tsx",
  "toggle.tsx",
]);

const SLOT_FILES = new Set(["button.tsx", "breadcrumb.tsx", "item.tsx"]);

const OVERLAY_FILES = new Set([
  "alert-dialog.tsx",
  "chart.tsx",
  "combobox.tsx",
  "context-menu.tsx",
  "dialog.tsx",
  "drawer.tsx",
  "dropdown-menu.tsx",
  "hover-card.tsx",
  "menubar.tsx",
  "navigation-menu.tsx",
  "popover.tsx",
  "select.tsx",
  "sheet.tsx",
]);

const MINIMAL_FILES = new Set(["presence.tsx", "aspect-ratio.tsx"]);

type ContractOverride = Pick<
  PrimitiveContract,
  "requiredPatterns" | "allowedLinePatterns" | "skipUpstream"
>;

const CONTRACT_OVERRIDES: Partial<Record<string, ContractOverride>> = {
  "erp-shell.tsx": {
    skipUpstream: true,
    requiredPatterns: [],
    allowedLinePatterns: [/rounded-lg/, /rounded-sm/],
  },
  "progress.tsx": {
    requiredPatterns: [/className/],
    allowedLinePatterns: [/style=\{\{/],
  },
  "chart.tsx": {
    requiredPatterns: [/cn\(/, /className/],
    allowedLinePatterns: [/#ccc/, /#fff/, /style=\{\{/],
  },
  "slider.tsx": {
    requiredPatterns: [/className/],
    allowedLinePatterns: [/bg-white/, /ring-black/],
  },
  "button.tsx": {
    requiredPatterns: [/cva\(/, /\bSlot\b/, /React\.ComponentProps/, /cn\(/],
    allowedLinePatterns: [/rounded-lg/],
  },
  "badge.tsx": {
    requiredPatterns: [/cva\(/, /cn\(/],
  },
  "toggle.tsx": {
    requiredPatterns: [/cva\(/, /cn\(/],
  },
  "input.tsx": {
    requiredPatterns: [/cn\(/, /className/],
  },
  "dialog.tsx": {
    requiredPatterns: [/cn\(/, /className/],
  },
  "presence.tsx": {
    requiredPatterns: [],
  },
  "aspect-ratio.tsx": {
    requiredPatterns: [/React\.ComponentProps/, /data-slot="/],
  },
  "collapsible.tsx": {
    requiredPatterns: [/React\.ComponentProps/, /data-slot="/],
  },
  "direction.tsx": {
    requiredPatterns: [/import \* as React from "react"/],
  },
  "input-group.tsx": {
    allowedLinePatterns: [/rounded-xl/],
  },
  "sidebar.tsx": {
    allowedLinePatterns: [/rounded-xl/, /rounded-md/, /rounded-lg/],
  },
  "skeleton.tsx": {
    allowedLinePatterns: [/rounded-2xl/],
  },
  "sonner.tsx": {
    requiredPatterns: [/className/],
    allowedLinePatterns: [/style=\{/],
  },
};

function buildContract(file: string, exports: string[]): PrimitiveContract {
  const override = CONTRACT_OVERRIDES[file];
  const requiredPatterns = [...(override?.requiredPatterns ?? [])];
  const allowedLinePatterns = [...(override?.allowedLinePatterns ?? [])];

  if (override?.requiredPatterns === undefined && CVA_FILES.has(file)) {
    requiredPatterns.push(/cva\(/, /cn\(/);
  }
  if (override?.requiredPatterns === undefined && SLOT_FILES.has(file)) {
    requiredPatterns.push(/\bSlot\b/);
  }
  if (MINIMAL_FILES.has(file) && override?.requiredPatterns === undefined) {
    requiredPatterns.length = 0;
  }
  if (OVERLAY_FILES.has(file)) {
    allowedLinePatterns.push(...OVERLAY_ALLOWED);
  }

  return {
    file,
    exports,
    requiredPatterns,
    allowedLinePatterns,
    skipUpstream: override?.skipUpstream,
  };
}

let contractByName: Map<string, PrimitiveContract> | undefined;

function ensureContractMap(): Map<string, PrimitiveContract> {
  if (contractByName) return contractByName;

  const exportEntries = {
    ...manifestExportMap(),
    ...AFENDA_ONLY_EXPORTS,
  };

  contractByName = new Map(
    Object.entries(exportEntries).map(([file, exports]) => [
      file,
      buildContract(file, exports),
    ]),
  );
  return contractByName;
}

export function getPrimitiveContract(fileName: string): PrimitiveContract | undefined {
  return ensureContractMap().get(fileName);
}

export function listPrimitiveContracts(): PrimitiveContract[] {
  return [...ensureContractMap().values()];
}

/** @internal test hook */
export function resetPrimitiveContractCache(): void {
  contractByName = undefined;
}
