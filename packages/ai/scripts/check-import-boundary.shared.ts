import { readdirSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { join, relative } from "node:path";

const require = createRequire(import.meta.url);

const SOURCE_ROOTS = ["apps", "packages"] as const;

const IGNORED_DIRECTORY_NAMES = new Set([
  ".artifacts",
  ".next",
  ".turbo",
  ".vercel",
  "coverage",
  "dist",
  "node_modules",
  "playwright-report",
  "test-results",
  "vitest-reports",
]);

const RG_IGNORE_GLOBS = [
  "**/node_modules/**",
  "**/.next/**",
  "**/.turbo/**",
  "**/.vercel/**",
  "**/.artifacts/**",
  "**/dist/**",
  "**/coverage/**",
  "**/playwright-report/**",
  "**/test-results/**",
  "**/vitest-reports/**",
];

const ROOT_AI_IMPORT_PATTERN =
  /(?:from\s+["']@afenda\/ai["']|vi\.mock\(["']@afenda\/ai["'])/;

function collectSourceFiles(dir: string, files: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (IGNORED_DIRECTORY_NAMES.has(entry.name)) {
        continue;
      }
      collectSourceFiles(join(dir, entry.name), files);
      continue;
    }

    if (/\.(ts|tsx)$/.test(entry.name)) {
      files.push(join(dir, entry.name));
    }
  }

  return files;
}

function resolveRipgrepExecutable(): string {
  try {
    return (require("@vscode/ripgrep") as { rgPath: string }).rgPath;
  } catch {
    return "rg";
  }
}

function findRootAiImportViolationsWithRipgrep(
  repoRoot: string,
): string[] | null {
  const rgArgs = [
    "--files-with-matches",
    "--glob",
    "**/*.{ts,tsx}",
    ...RG_IGNORE_GLOBS.flatMap((glob) => ["--glob", `!${glob}`]),
    String.raw`from ['"]@afenda/ai['"]|vi\.mock\(['"]@afenda/ai['"]`,
    ...SOURCE_ROOTS,
  ];

  const result = spawnSync(resolveRipgrepExecutable(), rgArgs, {
    cwd: repoRoot,
    encoding: "utf8",
    shell: resolveRipgrepExecutable() === "rg" && process.platform === "win32",
    maxBuffer: 16 * 1024 * 1024,
  });

  const errorCode =
    result.error && "code" in result.error ? result.error.code : undefined;
  if (errorCode === "ENOENT") {
    return null;
  }

  const stderr = result.stderr.trim();
  if (
    stderr.includes("not recognized") ||
    stderr.includes("ENOENT") ||
    stderr.includes("No such file or directory")
  ) {
    return null;
  }

  if (result.status === 1) {
    return [];
  }

  if (result.status !== 0) {
    throw new Error(stderr || "ripgrep import-boundary scan failed");
  }

  return result.stdout
    .trim()
    .split(/\r?\n/)
    .filter(Boolean)
    .map((file) => relative(repoRoot, file.replace(/\\/g, "/")))
    .sort();
}

function findRootAiImportViolationsWithWalk(repoRoot: string): string[] {
  const violations: string[] = [];

  for (const sourceRoot of SOURCE_ROOTS) {
    for (const file of collectSourceFiles(join(repoRoot, sourceRoot))) {
      if (ROOT_AI_IMPORT_PATTERN.test(readFileSync(file, "utf8"))) {
        violations.push(relative(repoRoot, file.replace(/\\/g, "/")));
      }
    }
  }

  return violations.sort();
}

export function findRootAiImportViolations(repoRoot: string): string[] {
  return (
    findRootAiImportViolationsWithRipgrep(repoRoot) ??
    findRootAiImportViolationsWithWalk(repoRoot)
  );
}
