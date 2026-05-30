/**
 * Shared utilities for @afenda/ui contract-drift audits.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

export type AuditSeverity = "error" | "warn";

export type AuditViolation = {
  layer: string;
  file: string;
  line: number;
  rule: string;
  match: string;
  hint: string;
  severity: AuditSeverity;
};

const auditsDir = dirname(fileURLToPath(import.meta.url));
export const packageRoot = join(auditsDir, "..");
export const uiSrc = join(packageRoot, "src");
export const repoRoot = join(packageRoot, "..", "..");
export const upstreamDir = join(packageRoot, ".upstream", "shadcn");
export const upstreamManifestPath = join(upstreamDir, "manifest.json");

/** Afenda-specific — not part of upstream shadcn contract. */
export const SHADCN_EXCLUDED_FILES = new Set([
  "erp-shell.tsx",
  "shell-frame.client.tsx",
]);

export function relPosix(file: string): string {
  return relative(repoRoot, file).replace(/\\/g, "/");
}

/** Primitives live flat in `packages/ui/src` — no recursive walk. */
export function walkUiTsxFiles(dir = uiSrc): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((entry) => extname(entry) === ".tsx")
    .map((entry) => join(dir, entry))
    .sort();
}

export function readUiFile(filePath: string): { content: string; lines: string[] } {
  const content = readFileSync(filePath, "utf8");
  return { content, lines: content.split("\n") };
}

export function fileNameFromPath(filePath: string): string {
  return filePath.split(/[/\\]/).pop() ?? filePath;
}

export function extractNamedExports(content: string): string[] {
  const block = /export\s*\{([^}]+)\}/s.exec(content);
  if (!block) return [];
  return block[1]!
    .split(",")
    .map((part) => part.trim().split(/\s+/).pop()!)
    .filter(Boolean);
}

export function extractRootFunctions(content: string): string[] {
  return [...content.matchAll(/(?:^|\n)\s*function\s+(\w+)\s*\(/gm)].map((m) => m[1]!);
}

export function extractDataSlots(content: string): string[] {
  return [...new Set([...content.matchAll(/data-slot="([^"]+)"/g)].map((m) => m[1]!))];
}

export function extractDisplayNames(content: string): string[] {
  return [...content.matchAll(/\.displayName\s*=\s*["']([^"']+)["']/g)].map(
    (m) => m[1]!,
  );
}

export function isShadcnPrimitiveFile(fileName: string): boolean {
  return fileName.endsWith(".tsx") && !SHADCN_EXCLUDED_FILES.has(fileName);
}

export function matchAllOnLine(line: string, pattern: RegExp): RegExpMatchArray[] {
  const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
  if (flags === pattern.flags) {
    pattern.lastIndex = 0;
    return [...line.matchAll(pattern)];
  }
  return [...line.matchAll(new RegExp(pattern.source, flags))];
}

export function printViolations(
  title: string,
  violations: AuditViolation[],
  maxShown = 40,
): { errors: number; warnings: number } {
  console.log(`\n${title}`);
  console.log("-".repeat(40));

  if (violations.length === 0) {
    console.log("  ✓ No drift detected.");
    return { errors: 0, warnings: 0 };
  }

  const shown = violations.slice(0, maxShown);
  for (const v of shown) {
    const prefix = v.severity === "warn" ? "⚠" : "✗";
    const loc = v.line > 0 ? `${v.file}:${v.line}` : v.file;
    console.log(`  ${prefix} ${loc}  [${v.rule}]  ${v.match}`);
    console.log(`    → ${v.hint}`);
  }

  if (violations.length > maxShown) {
    console.log(`  … ${violations.length - maxShown} more (truncated)`);
  }

  const errors = violations.filter((v) => v.severity === "error").length;
  const warnings = violations.filter((v) => v.severity === "warn").length;
  console.log(`\n  ${errors} error(s), ${warnings} warning(s)`);
  return { errors, warnings };
}

export function assertPathsExist(): void {
  if (!existsSync(uiSrc)) {
    console.error(`Missing UI source: ${uiSrc}`);
    process.exit(1);
  }
}
