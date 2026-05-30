/**
 * shadcn composition audit for consumer TSX (features, apps/erp, governed-surface kernel).
 *
 * Does NOT detect streaming layout drift (Suspense skeleton ↔ renderer geometry).
 * Use `pnpm audit:skeleton-parity` for KPI/stat skeleton parity.
 * Use `pnpm audit:list-surface-chrome` for list toolbar/footer alignment.
 *
 * Run:
 *   pnpm audit:shadcn-composition
 *   pnpm audit:shadcn-composition --strict
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

type Severity = "error" | "warning" | "info";

type Rule = {
  id: string;
  description: string;
  pattern: RegExp;
  suggestion: string;
  severity: Severity;
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

const RULES: Rule[] = [
  {
    id: "no-space-stack",
    severity: "error",
    description: "Use flex + gap-* instead of space-y-* / space-x-*",
    pattern: /\bspace-[xy]-\d+\b/g,
    suggestion: "flex flex-col gap-* or flex flex-row gap-*",
    fileFilter: /\.tsx$/,
  },
  {
    id: "no-raw-button",
    severity: "error",
    description: "Use Button from @afenda/ui instead of raw <button>",
    pattern: /<button\b/g,
    suggestion: "import { Button } from '@afenda/ui'",
    fileFilter: /\.tsx$/,
  },
  {
    id: "prefer-field-group",
    severity: "warning",
    description: "Forms with grid layout should use FieldGroup from @afenda/ui",
    pattern: /<form\b[^>]*className="[^"]*\bgrid\b/g,
    suggestion: "Wrap fields in FieldGroup; import from @afenda/ui",
    fileFilter: /\.client\.tsx$/,
  },
  {
    id: "no-tile-div",
    severity: "warning",
    description: "Tile chrome should use Card from @afenda/ui",
    pattern:
      /className="[^"]*\brounded-(?:section|card|panel|control)[^"]*\bborder[^"]*\bp-[46]\b/g,
    suggestion: "Use Card + CardContent from @afenda/ui",
    fileFilter: /governed-surface\/src\/metadata\/renderers/,
  },
];

type Scope = "features" | "app" | "governed-surface" | "all";

function parseScopeArg(args: string[]): Scope {
  const flag = args.find((a) => a.startsWith("--scope="));
  if (!flag) return "all";
  const value = flag.split("=")[1] ?? "";
  if (value === "app" || value === "features" || value === "governed-surface") {
    return value;
  }
  return "all";
}

function resolveScanDirs(scope: Scope, repoRoot: string): string[] {
  const dirs: string[] = [];
  if (scope === "app" || scope === "all") {
    const appSrc = join(repoRoot, "apps", "erp", "src");
    if (existsSync(appSrc)) dirs.push(appSrc);
  }
  if (scope === "governed-surface" || scope === "all") {
    const governedSrc = join(
      repoRoot,
      "packages",
      "governed-surface",
      "src",
    );
    if (existsSync(governedSrc)) dirs.push(governedSrc);
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

function walkFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      results.push(...walkFiles(full));
    } else if (extname(entry) === ".tsx") {
      results.push(full);
    }
  }
  return results;
}

/** File-level composition checks (nested Card, section anti-patterns). */
function auditFileLevel(filePath: string, content: string): Violation[] {
  const rel = filePath.replace(/\\/g, "/");
  const violations: Violation[] = [];
  const isProduct =
    rel.includes("apps/erp/src/") ||
    rel.includes("packages/features/") ||
    rel.includes("packages/governed-surface/src/");
  if (!isProduct || !rel.endsWith(".tsx")) {
    return violations;
  }

  const suppressFile = /\/\/\s*audit-shadcn:\s*ignore-file/.test(content);
  if (suppressFile) return violations;

  const cardOpens = (content.match(/<Card[\s>/]/g) ?? []).length;
  const hasSectionPanel = /\bSectionPanel(?!Lite)\b/.test(content);
  const isSectionFile =
    /section\.component\.(server|client)\.tsx$/i.test(rel) ||
    /-section\.server\.tsx$/i.test(rel);
  const isPlayground = /playground|gallery|metadata-renderer-gallery/i.test(rel);

  if (
    isSectionFile &&
    !isPlayground &&
    cardOpens >= 1 &&
    !hasSectionPanel &&
    !/\/\/\s*audit-shadcn:\s*ignore\s+prefer-section-panel/.test(content)
  ) {
    violations.push({
      file: filePath,
      line: 1,
      col: 1,
      ruleId: "prefer-section-panel",
      match: `${cardOpens}× <Card>`,
      suggestion:
        "Use SectionPanel from @afenda/ui for module sections — see packages/ui/COMPOSITION.md",
      severity: "warning",
    });
  }

  if (cardOpens >= 3 && !hasSectionPanel && !isPlayground) {
    violations.push({
      file: filePath,
      line: 1,
      col: 1,
      ruleId: "excessive-card-usage",
      match: `${cardOpens}× <Card>`,
      suggestion:
        "Prefer SectionPanel + BulletColumns / ObservabilityIndicatorList — see packages/ui/COMPOSITION.md",
      severity: "warning",
    });
  }

  if (/<CardContent[\s\S]*?<Card[\s>/]/m.test(content)) {
    violations.push({
      file: filePath,
      line: 1,
      col: 1,
      ruleId: "no-nested-card",
      match: "<Card> inside <CardContent>",
      suggestion: "Flatten layout with SectionPanel or sibling Cards — no nested Card",
      severity: "error",
    });
  }

  if (
    /<div[^>]*className="[^"]*\brounded-(?:control|section|card)\b[^"]*\bborder\b[^"]*\bp-surface-/m.test(
      content,
    ) &&
    !/\bSectionPanel(?!Lite)\b/.test(content) &&
    !/\/\/\s*audit-shadcn:\s*ignore\s+no-fake-card-div/.test(content)
  ) {
    violations.push({
      file: filePath,
      line: 1,
      col: 1,
      ruleId: "no-fake-card-div",
      match: "rounded-* border p-surface-* div",
      suggestion: "Use SectionPanel or Card with CardHeader — not a styled div",
      severity: "warning",
    });
  }

  if (
    cardOpens > 0 &&
    !/<CardHeader\b/.test(content) &&
    !isPlayground &&
    !/\/\/\s*audit-shadcn:\s*ignore\s+card-without-header/.test(content)
  ) {
    violations.push({
      file: filePath,
      line: 1,
      col: 1,
      ruleId: "card-without-header",
      match: "<Card> without <CardHeader>",
      suggestion:
        "Use CardHeader + CardTitle (+ CardDescription) or switch to SectionPanel",
      severity: "info",
    });
  }

  if (
    /\bSectionPanelLite\b/.test(content) &&
    !/\/\/\s*audit-shadcn:\s*ignore\s+section-panel-lite/.test(content)
  ) {
    violations.push({
      file: filePath,
      line: 1,
      col: 1,
      ruleId: "no-section-panel-lite",
      match: "SectionPanelLite",
      suggestion:
        "Import SubsectionPanel from @afenda/ui — see packages/ui/COMPOSITION.md",
      severity: "error",
    });
  }

  return violations;
}

function auditFile(filePath: string, rules: Rule[]): Violation[] {
  const content = readFileSync(filePath, "utf8");
  const lines = content.split("\n");
  const violations: Violation[] = [...auditFileLevel(filePath, content)];
  const hasFieldGroupImport =
    /from\s+["']@afenda\/ui(?:\/field)?["']/.test(content) &&
    /\bFieldGroup\b/.test(content);

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const lineText = lines[lineIndex]!;
    const lineNumber = lineIndex + 1;

    if (/\/\/\s*audit-shadcn:\s*ignore/.test(lineText)) continue;

    for (const rule of rules) {
      if (rule.fileFilter && !rule.fileFilter.test(filePath.replace(/\\/g, "/"))) {
        continue;
      }
      if (rule.id === "prefer-field-group" && hasFieldGroupImport) {
        continue;
      }

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

function main(): void {
  const args = process.argv.slice(2);
  const strict = args.includes("--strict");
  const scope = parseScopeArg(args);

  const repoRoot = join(
    fileURLToPath(import.meta.url),
    "..",
    "..",
    "..",
  );

  const files: string[] = [];
  for (const dir of resolveScanDirs(scope, repoRoot)) {
    files.push(...walkFiles(dir));
  }

  const violations: Violation[] = [];
  for (const file of files) {
    violations.push(...auditFile(file, RULES));
  }

  console.log(`shadcn composition audit  [scope: ${scope}]`);
  console.log("=".repeat(50));

  if (violations.length === 0) {
    console.log("No composition violations found.");
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
    for (const v of fileViolations) {
      console.log(
        `  [${v.severity.padEnd(7)}]  ${rel}:${v.line}:${v.col}  ${v.match}  →  ${v.suggestion}  [${v.ruleId}]`,
      );
    }
    console.log();
  }

  const errorCount = violations.filter((v) => v.severity === "error").length;
  const warnCount = violations.filter((v) => v.severity === "warning").length;
  console.log(
    `Total: ${violations.length} (${errorCount} errors, ${warnCount} warnings)`,
  );

  if (strict && (errorCount > 0 || warnCount > 0)) {
    process.exit(1);
  }
}

main();
