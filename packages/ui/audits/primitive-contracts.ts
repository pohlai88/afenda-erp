/**
 * Per-primitive contract manifests for @afenda/ui.
 *
 * Export doors come from `.upstream/shadcn/manifest.json` (single source of truth).
 * Pattern rules live here as representative structure checks — not subjective design.
 */
import { manifestExportMap } from "./load-manifest.ts";
import { UI_TW_ANIMATE_CLASS_PATTERN } from "../src/design-system.color-contract.shared.ts";

export type PrimitiveContract = {
  file: string;
  /** From upstream manifest — export drift is enforced in layer 1, not layer 3. */
  manifestExports: string[];
  requiredPatterns: RegExp[];
  /** Non-global patterns only; matched per line in token-drift audit. */
  allowedLinePatterns: RegExp[];
};

/** Afenda-only surfaces — not in upstream shadcn manifest. */
const AFENDA_ONLY_EXPORTS: Record<string, string[]> = {
  "erp-shell.tsx": ["ShellFrame"],
};

export const FORBIDDEN_UI_PATTERNS: Array<{
  rule: string;
  hint: string;
  severity: "error" | "warn";
  linePattern: RegExp;
}> = [
  {
    rule: "no-inline-style",
    hint: "Use semantic tokens and Tailwind utilities — inline style is contract drift",
    severity: "error",
    linePattern: /style=\{\{/g,
  },
  {
    rule: "no-raw-hex-color",
    hint: "Use semantic color tokens — never hard-code hex in primitives",
    severity: "error",
    linePattern: /#[0-9a-fA-F]{3,8}\b/g,
  },
  {
    rule: "no-raw-color-function",
    hint: "Use semantic color tokens — never hard-code rgb/hsl in primitives",
    severity: "error",
    linePattern: /\b(?:rgb|rgba|hsl)\(/g,
  },
  {
    rule: "no-raw-neutral-surface",
    hint: "Use bg-background, text-foreground, border-border — not raw neutrals",
    severity: "error",
    linePattern: /\bbg-white\b|\btext-black\b|\bborder-gray\b/g,
  },
  {
    rule: "no-raw-elevation-shadow",
    hint: "Use shadow-elevation-* tokens when migrating overlay surfaces",
    severity: "warn",
    linePattern: /\bshadow-(?:lg|xl|2xl)\b/g,
  },
  {
    rule: "no-raw-radius",
    hint: "Use rounded-control, rounded-section, rounded-card, rounded-panel",
    severity: "warn",
    linePattern: /\brounded-(?:sm|md|lg|xl|2xl|3xl)\b/g,
  },
  {
    rule: "no-tw-animate",
    hint: "Use uiMotion.* and @theme --animate-* tokens — tw-animate-css is removed",
    severity: "error",
    linePattern: UI_TW_ANIMATE_CLASS_PATTERN,
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

const MINIMAL_FILES = new Set(["presence.tsx", "aspect-ratio.tsx"]);

type ContractOverride = Pick<
  PrimitiveContract,
  "requiredPatterns" | "allowedLinePatterns"
>;

const CONTRACT_OVERRIDES: Partial<Record<string, ContractOverride>> = {
  "erp-shell.tsx": {
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
  "sonner.tsx": {
    requiredPatterns: [/className/],
    allowedLinePatterns: [/style=\{/],
  },
};

function buildContract(file: string, manifestExports: string[]): PrimitiveContract {
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

  return {
    file,
    manifestExports,
    requiredPatterns,
    allowedLinePatterns,
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
