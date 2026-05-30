/**
 * Validates Tailwind v4 token contract parity between globals.css and design-system.ts.
 *
 * Run: pnpm audit:tailwind-token-parity
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  UI_BANNED_TEXT_FILL_UTILITIES,
  UI_COLOR_FILL_TOKENS,
  UI_TYPOGRAPHY_UTILITY_KEYS,
} from "../src/design-system.color-contract.shared.ts";
import { uiTypography } from "../src/design-system.ts";

const repoRoot = join(fileURLToPath(import.meta.url), "..", "..", "..", "..");
const globalsCssPath = join(repoRoot, "apps", "erp", "src", "app", "globals.css");

function read(path: string): string {
  if (!existsSync(path)) {
    console.error(`Missing file: ${path}`);
    process.exit(1);
  }
  return readFileSync(path, "utf8");
}

function extractTypeUtilities(css: string): Set<string> {
  const utilities = new Set<string>();
  for (const match of css.matchAll(/@utility\s+(type-[\w-]+)/g)) {
    utilities.add(match[1]!);
  }
  return utilities;
}

function extractThemeColorTokens(css: string): Set<string> {
  const tokens = new Set<string>();
  const themeBlock = /@theme inline \{([\s\S]*?)\n\}/m.exec(css);
  if (!themeBlock) return tokens;
  for (const match of themeBlock[1]!.matchAll(/--color-([\w-]+):/g)) {
    tokens.add(match[1]!);
  }
  return tokens;
}

function main(): void {
  const css = read(globalsCssPath);
  const typeUtilities = extractTypeUtilities(css);
  const themeColors = extractThemeColorTokens(css);

  let failed = false;

  console.log("Tailwind token parity audit");
  console.log("=".repeat(40));

  console.log("\n1. uiTypography → globals.css @utility type-*");
  for (const key of UI_TYPOGRAPHY_UTILITY_KEYS) {
    const utility = uiTypography[key as keyof typeof uiTypography];
    if (utility == null || !utility.startsWith("type-")) {
      console.error(`  ✗ uiTypography.${key} = "${utility}" (expected type-* utility)`);
      failed = true;
      continue;
    }
    if (!typeUtilities.has(utility)) {
      console.error(
        `  ✗ uiTypography.${key} → "${utility}" missing @utility in globals.css`,
      );
      failed = true;
    } else {
      console.log(`  ✓ ${key} → ${utility}`);
    }
  }

  console.log("\n2. Fill tokens registered in @theme (bg-* only for copy contexts)");
  for (const token of UI_COLOR_FILL_TOKENS) {
    const inTheme = themeColors.has(token);
    console.log(
      `  · ${token.padEnd(18)} ${inTheme ? "in @theme" : "not in @theme"} — use text-${token}-foreground or type-*`,
    );
  }

  console.log("\n3. Banned copy utilities");
  for (const banned of UI_BANNED_TEXT_FILL_UTILITIES) {
    if (new RegExp(`@utility\\s+${banned.replace("-", "\\-")}\\b`).test(css)) {
      console.error(`  ✗ @utility ${banned} must not exist (conflicts with @theme --color-*)`);
      failed = true;
    } else {
      console.log(`  ✓ no @utility ${banned}`);
    }
  }

  if (failed) {
    console.error("\nToken parity check failed.");
    process.exit(1);
  }

  console.log("\nToken parity check passed.");
}

main();
