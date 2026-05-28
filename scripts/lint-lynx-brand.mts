#!/usr/bin/env tsx
/**
 * lint:lynx-brand
 *
 * Scans Lynx-flipped surfaces for banned legacy terms.
 * Phase B of the Lynx brand ladder — allowlists non-flipped surfaces.
 *
 * Flipped surfaces (Phase B):
 *   - apps/erp/src/app/(app)/solution-console/**
 *   - packages/kernel/src/shell/navigation-extensions.ts
 *   - packages/kernel/src/shell/route-copy-metadata.ts
 *   - packages/ai/src/prompts/ai.system-prompt.ts         (getSolutionProviderSystemPrompt)
 *   - packages/features/lynx/**
 *
 * Non-flipped (allowlisted until Phase C):
 *   - ERP Assistant (chat route, erp-assistant-panel)
 *   - Any file outside FLIPPED_PATHS
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(import.meta.url), "../../");

const FLIPPED_PATHS = [
  "apps/erp/src/app/(app)/solution-console",
  "apps/erp/src/app/(app)/solution-console/lynx-operator-panel.tsx",
  "packages/kernel/src/shell/navigation-extensions.ts",
  "packages/kernel/src/shell/route-copy-metadata.ts",
  "packages/ai/src/prompts/ai.system-prompt.ts",
  "packages/features/lynx",
  "apps/erp/src/app/api/lynx",
];

const BANNED_TERMS = [
  /\bSolution Provider Agent\b/,
  /\bSolution Provider Console\b/,
  /\bSolution Provider calls\b/i,
  /\bSolution Console\b(?!\s+pageMetadata)/, // allow the exported const name itself
  /\bAI native\b/i,
  /\bYou are Afenda Solution Provider Agent\b/,
  /\bThe agent must\b/i,
];

const ALLOWED_COMMENT_PATTERN = /\/\/\s*lint:lynx-brand:allow/;

function* walkFiles(dir: string): Generator<string> {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (
        entry.name === "node_modules" ||
        entry.name === ".next" ||
        entry.name === "dist"
      )
        continue;
      yield* walkFiles(full);
    } else if (
      entry.isFile() &&
      /\.(ts|tsx|mts|js|jsx|mjs)$/.test(entry.name)
    ) {
      yield full;
    }
  }
}

function isFlipped(filePath: string): boolean {
  const rel = relative(ROOT, filePath).replace(/\\/g, "/");
  return FLIPPED_PATHS.some((p) => rel.startsWith(p) || rel === p);
}

let errorCount = 0;

for (const path of FLIPPED_PATHS) {
  const abs = join(ROOT, path);
  let stat: ReturnType<typeof statSync> | null = null;
  try {
    stat = statSync(abs);
  } catch {
    continue;
  }

  const files = stat.isDirectory() ? [...walkFiles(abs)] : [abs];

  for (const file of files) {
    if (!isFlipped(file)) continue;
    const content = readFileSync(file, "utf8");
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      if (ALLOWED_COMMENT_PATTERN.test(line)) continue;

      for (const term of BANNED_TERMS) {
        if (term.test(line)) {
          const rel = relative(ROOT, file).replace(/\\/g, "/");
          console.error(`  [lynx-brand] ${rel}:${i + 1}  banned term: ${term}`);
          console.error(`    ${line.trim()}`);
          errorCount++;
        }
      }
    }
  }
}

if (errorCount === 0) {
  console.log(
    `✓ lint:lynx-brand — all flipped surfaces use approved machine-layer language.`,
  );
  process.exit(0);
} else {
  console.error(
    `\n✗ lint:lynx-brand — ${errorCount} banned term(s) found in flipped surfaces.`,
  );
  process.exit(1);
}
