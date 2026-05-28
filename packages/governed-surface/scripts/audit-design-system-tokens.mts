/**
 * Design-system token audit for `@afenda/governed-surface` (and optionally consumers).
 *
 * Scans every `.ts` / `.tsx` file under the specified scope and reports where raw Tailwind
 * primitives bypass the `@afenda/ui/design-system` token contract.
 *
 * Run:
 *   pnpm audit:governed-design-tokens                     # governed-surface only (default)
 *   pnpm audit:governed-design-tokens --strict            # exits 1 on error-level violations
 *   pnpm audit:governed-design-tokens --scope=app        # apps/erp/src (warn-only)
 *   pnpm audit:governed-design-tokens --scope=features   # packages/features (warn-only)
 *   pnpm audit:governed-design-tokens --scope=all        # governed + app + features
 *
 * Suppression (per line):
 *   className="z-10"  // audit-ds: ignore
 *   className="z-10"  // audit-ds: ignore no-raw-z-numeric
 *   const cls = "min-w-[720px]";  // audit-ds: ignore no-arbitrary-value — table scroll contract
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Severity = "error" | "warning" | "info";

type Rule = {
  id: string;
  description: string;
  /** Regex applied per-line. Must have `g` flag. */
  pattern: RegExp;
  suggestion: string;
  severity: Severity;
  /** When set, the rule only fires on files whose path matches. */
  fileFilter?: RegExp;
};

type Violation = {
  file: string;
  line: number;
  col: number;
  ruleId: string;
  match: string;
  suggestion: string;
  severity: Severity;
};

// ---------------------------------------------------------------------------
// Rule definitions
// ---------------------------------------------------------------------------

const RULES: Rule[] = [
  {
    id: "no-raw-z-numeric",
    severity: "error",
    description: "Raw numeric z-index class (numeric or bracket form)",
    // Catches z-10, z-50, z-[1], z-[999]
    pattern: /\bz-(\d+|\[\d+\])\b/g,
    suggestion:
      "z-raised | z-overlay | z-modal | z-tooltip | z-sidebar  (uiZIndex from @afenda/ui/design-system)",
  },
  {
    id: "no-viewport-breakpoint",
    severity: "warning",
    description:
      "Viewport breakpoint inside governed component — use container queries",
    pattern: /(?<!@)\b(sm|md|lg|xl|2xl):/g,
    suggestion: "@sm: | @md: | @lg:  (requires @container on a wrapping element)",
    fileFilter: /\.tsx$/,
  },
  {
    id: "no-raw-radius",
    severity: "warning",
    description: "Raw Tailwind radius class — use ui.radius.* semantic tokens",
    pattern: /\brounded-(sm|md|lg|xl|2xl|3xl)\b/g,
    suggestion:
      "rounded-section | rounded-card | rounded-popover | rounded-control | rounded-chip  (uiRadius)",
  },
  {
    id: "no-raw-elevation-shadow",
    severity: "warning",
    description: "Raw Tailwind shadow — use shadow-elevation-* tokens",
    pattern: /\bshadow-(sm|md|lg|xl|2xl)\b/g,
    suggestion:
      "shadow-elevation-1 | shadow-elevation-2 | shadow-elevation-3  (uiSurfaceElevation)",
  },
  {
    id: "no-destructive-as-status",
    severity: "warning",
    description:
      "Using destructive tone for operational status — use critical tone instead",
    // Matches bg-destructive, text-destructive, ring-destructive, border-destructive,
    // and directional border variants: border-l-destructive, border-r-destructive, etc.
    pattern: /\b(bg|text|ring|border(?:-[lrtbxy])?)-destructive\b/g,
    suggestion:
      "bg-critical/* | text-critical | ring-critical | border-l-critical  (uiRiskToneClasses / uiStatusToneClasses)",
  },
  {
    id: "no-raw-typography",
    severity: "warning",
    description:
      "Raw Tailwind text-size class — use type-* semantic utilities instead",
    // Covers the full scale: text-xs, text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl
    pattern: /\btext-(xs|sm|base|lg|xl|2xl|3xl)\b/g,
    suggestion:
      "type-caption | type-body | type-control | type-label | type-mono-cell | type-card-title | type-section-title | type-page-title  (uiTypography)",
    fileFilter: /\.tsx$/,
  },
  {
    id: "no-arbitrary-value",
    severity: "warning",
    description:
      "Arbitrary Tailwind value — use a design token or document the layout edge with a suppression comment",
    // Catches: text-[10px], z-[1], w-[28rem], min-h-[14rem], max-w-[320px], gap-[16px], p-[8px], rounded-[4px], etc.
    pattern:
      /\b(?:text|z|w|h|min-w|min-h|max-w|max-h|gap|p[xytblr]?|m[xytblr]?|rounded)-\[[^\]]+\]/g,
    suggestion:
      "Use a uiSurfaceInset / uiTypography / uiZIndex token, or suppress:  // audit-ds: ignore no-arbitrary-value — <reason>",
    fileFilter: /\.tsx$/,
  },
  {
    id: "no-raw-gap-semantic",
    severity: "info",
    description: "Raw gap value with a semantic equivalent",
    pattern: /\bgap-(4|6|8|10|12)\b/g,
    suggestion:
      "gap-surface-md | gap-surface-lg | gap-surface-2xl | gap-density-*  (uiSurfaceGap / uiDensity)",
  },
  {
    id: "no-raw-spacing-semantic",
    severity: "info",
    description: "Raw margin/padding with a semantic equivalent",
    pattern: /\b(mt|mb|mx|my|pt|pb|px|py)-(4|6|8|10|12)\b/g,
    suggestion:
      "*-surface-xs…3xl | *-density-*  (uiSurfaceInset / uiDensity)",
  },
];

// ---------------------------------------------------------------------------
// Scope resolution
// ---------------------------------------------------------------------------

type Scope = "governed" | "app" | "features" | "all";

function parseScopeArg(args: string[]): Scope {
  const flag = args.find((a) => a.startsWith("--scope="));
  if (!flag) return "governed";
  const value = flag.split("=")[1] ?? "";
  if (value === "app" || value === "features" || value === "all") return value;
  console.error(`Unknown --scope value: "${value}". Using "governed".`);
  return "governed";
}

function resolveScanDirs(
  scope: Scope,
  repoRoot: string,
  packageRoot: string,
): string[] {
  const dirs: string[] = [];
  if (scope === "governed" || scope === "all") {
    dirs.push(join(packageRoot, "src"));
  }
  if (scope === "app" || scope === "all") {
    const appSrc = join(repoRoot, "apps", "erp", "src");
    if (existsSync(appSrc)) dirs.push(appSrc);
  }
  if (scope === "features" || scope === "all") {
    const featuresRoot = join(repoRoot, "packages", "features");
    if (existsSync(featuresRoot)) {
      for (const entry of readdirSync(featuresRoot)) {
        const featureSrc = join(featuresRoot, entry, "src");
        if (existsSync(featureSrc) && statSync(featureSrc).isDirectory()) {
          dirs.push(featureSrc);
        }
      }
    }
  }
  return dirs;
}

// ---------------------------------------------------------------------------
// File walker
// ---------------------------------------------------------------------------

function walkFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      results.push(...walkFiles(full));
    } else {
      const ext = extname(entry);
      if (ext === ".ts" || ext === ".tsx") {
        results.push(full);
      }
    }
  }
  return results;
}

// ---------------------------------------------------------------------------
// Per-file audit
// ---------------------------------------------------------------------------

function auditFile(filePath: string, rules: Rule[]): Violation[] {
  const content = readFileSync(filePath, "utf8");
  const lines = content.split("\n");
  const violations: Violation[] = [];

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const lineText = lines[lineIndex]!;
    const lineNumber = lineIndex + 1;
    // Previous line for JSX {/* audit-ds: ignore */} comments (cannot place // on attribute lines)
    const prevLineText = lineIndex > 0 ? (lines[lineIndex - 1] ?? "") : "";

    // Parse suppression comment — supported forms:
    //   Same line:     // audit-ds: ignore
    //   Same line:     // audit-ds: ignore no-raw-typography — reason
    //   Previous line: {/* audit-ds: ignore */}
    //   Previous line: {/* audit-ds: ignore no-raw-typography — reason */}
    function detectSuppress(text: string): { all: boolean; ruleId: string | null } {
      const all =
        /\/\/\s*audit-ds:\s*ignore\s*($|—|-)/.test(text) ||
        /\{\/\*\s*audit-ds:\s*ignore\s*(?:—|-|\*\/)/.test(text);
      const m =
        /\/\/\s*audit-ds:\s*ignore\s+([\w-]+)/.exec(text) ??
        /\{\/\*\s*audit-ds:\s*ignore\s+([\w-]+)/.exec(text);
      return { all, ruleId: m ? (m[1] ?? null) : null };
    }

    const cur = detectSuppress(lineText);
    const prev = detectSuppress(prevLineText);
    const suppressAll = cur.all || prev.all;
    const suppressedRuleId = cur.ruleId ?? prev.ruleId;

    for (const rule of rules) {
      if (rule.fileFilter && !rule.fileFilter.test(filePath)) {
        continue;
      }
      if (suppressAll) continue;
      if (suppressedRuleId && suppressedRuleId === rule.id) continue;

      rule.pattern.lastIndex = 0;

      let match: RegExpExecArray | null;
      while ((match = rule.pattern.exec(lineText)) !== null) {
        violations.push({
          file: filePath,
          line: lineNumber,
          col: match.index + 1,
          ruleId: rule.id,
          match: match[0],
          suggestion: rule.suggestion,
          severity: rule.severity,
        });
      }
    }
  }

  return violations;
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

const SEVERITY_LABEL: Record<Severity, string> = {
  error: "error  ",
  warning: "warning",
  info: "info   ",
};

const SEVERITY_ORDER: Record<Severity, number> = {
  error: 0,
  warning: 1,
  info: 2,
};

function formatViolation(v: Violation, repoRoot: string): string {
  const rel = relative(repoRoot, v.file).replace(/\\/g, "/");
  const label = SEVERITY_LABEL[v.severity];
  const location = `${rel}:${v.line}:${v.col}`;
  return `  [${label}]  ${location.padEnd(72)}  ${v.match.padEnd(30)}  →  ${v.suggestion}  [${v.ruleId}]`;
}

function printReport(
  violations: Violation[],
  repoRoot: string,
  strict: boolean,
  scope: Scope,
): void {
  const scopeLabel =
    scope === "governed"
      ? "governed-surface"
      : scope === "app"
        ? "apps/erp"
        : scope === "features"
          ? "packages/features"
          : "all scopes";

  console.log(`Design-system token audit  [scope: ${scopeLabel}]`);
  console.log("=".repeat(50) + "\n");

  if (violations.length === 0) {
    console.log("No violations found. All files use design-system tokens correctly.");
    return;
  }

  const byFile = new Map<string, Violation[]>();
  for (const v of violations) {
    const group = byFile.get(v.file) ?? [];
    group.push(v);
    byFile.set(v.file, group);
  }

  for (const [file, fileViolations] of byFile) {
    const rel = relative(repoRoot, file).replace(/\\/g, "/");
    console.log(rel);
    const sorted = [...fileViolations].sort(
      (a, b) =>
        a.line - b.line ||
        SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
    );
    for (const v of sorted) {
      console.log(formatViolation(v, repoRoot));
    }
    console.log();
  }

  const byRule = new Map<
    string,
    { severity: Severity; count: number; files: Set<string> }
  >();
  for (const v of violations) {
    const entry = byRule.get(v.ruleId) ?? {
      severity: v.severity,
      count: 0,
      files: new Set(),
    };
    entry.count++;
    entry.files.add(v.file);
    byRule.set(v.ruleId, entry);
  }

  console.log("Summary");
  console.log("-------");
  for (const [ruleId, info] of [...byRule.entries()].sort(
    (a, b) => SEVERITY_ORDER[a[1].severity] - SEVERITY_ORDER[b[1].severity],
  )) {
    const label = SEVERITY_LABEL[info.severity];
    console.log(
      `  [${label}]  ${ruleId.padEnd(28)}  ${String(info.count).padStart(3)} violation${info.count === 1 ? " " : "s"} in ${info.files.size} file${info.files.size === 1 ? "" : "s"}`,
    );
  }

  const errorCount = violations.filter((v) => v.severity === "error").length;
  const warnCount = violations.filter((v) => v.severity === "warning").length;
  const infoCount = violations.filter((v) => v.severity === "info").length;

  console.log(
    `\nTotal: ${violations.length} violation${violations.length === 1 ? "" : "s"} in ${byFile.size} file${byFile.size === 1 ? "" : "s"} ` +
      `(${errorCount} error${errorCount === 1 ? "" : "s"}, ${warnCount} warning${warnCount === 1 ? "" : "s"}, ${infoCount} info)`,
  );

  if (strict && errorCount > 0) {
    console.log("\n--strict mode: exits 1 on error-level violations.");
  } else if (!strict && errorCount > 0) {
    console.log(
      `\nRun with --strict to exit 1 on the ${errorCount} error${errorCount === 1 ? "" : "s"}.`,
    );
  }
  if (scope !== "governed") {
    console.log(
      "\n(Advisory scan — non-governed scopes are informational and do not gate CI.)",
    );
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  const args = process.argv.slice(2);
  const strict = args.includes("--strict");
  const scope = parseScopeArg(args);

  const packageRoot = join(
    fileURLToPath(import.meta.url),
    "..", // scripts/
    "..", // governed-surface/
  );
  const repoRoot = join(packageRoot, "..", "..");

  const scanDirs = resolveScanDirs(scope, repoRoot, packageRoot);

  const files: string[] = [];
  for (const dir of scanDirs) {
    files.push(...walkFiles(dir));
  }

  const allViolations: Violation[] = [];
  for (const file of files) {
    allViolations.push(...auditFile(file, RULES));
  }

  allViolations.sort(
    (a, b) =>
      SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] ||
      a.file.localeCompare(b.file) ||
      a.line - b.line,
  );

  printReport(allViolations, repoRoot, strict, scope);

  // --strict only gates on errors in the governed-surface scope
  const errorCount = allViolations.filter((v) => v.severity === "error").length;
  if (strict && scope === "governed" && errorCount > 0) {
    process.exit(1);
  }
}

main();
