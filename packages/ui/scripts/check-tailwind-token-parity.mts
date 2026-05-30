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
  UI_COLOR_FILL_KEYS,
  UI_COLOR_FILL_TOKENS,
  UI_COLOR_INK_KEYS,
  UI_SURFACE_UTILITY_KEYS,
  UI_TYPOGRAPHY_UTILITY_KEYS,
  buildBannedTextFillPattern,
  buildRawPalettePattern,
  UI_TW_ANIMATE_CLASS_PATTERN,
  UI_REDUNDANT_INK_PATTERN,
} from "../src/design-system.color-contract.shared.ts";
import { uiColorFill, uiColorInk, uiSurface, uiTypography } from "../src/design-system.ts";

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

function extractSurfaceUtilities(css: string): Set<string> {
  const utilities = new Set<string>();
  for (const match of css.matchAll(/@utility\s+(surface-[\w-]+)/g)) {
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
  const surfaceUtilities = extractSurfaceUtilities(css);
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

  console.log("\n2. uiSurface → globals.css @utility surface-*");
  for (const key of UI_SURFACE_UTILITY_KEYS) {
    const utility = uiSurface[key as keyof typeof uiSurface];
    if (utility == null || !utility.startsWith("surface-")) {
      console.error(`  ✗ uiSurface.${key} = "${utility}" (expected surface-* utility)`);
      failed = true;
      continue;
    }
    if (!surfaceUtilities.has(utility)) {
      console.error(
        `  ✗ uiSurface.${key} → "${utility}" missing @utility in globals.css`,
      );
      failed = true;
    } else {
      console.log(`  ✓ ${key} → ${utility}`);
    }
  }

  console.log("\n3. Fill tokens registered in @theme (bg-* only for copy contexts)");
  for (const token of UI_COLOR_FILL_TOKENS) {
    const inTheme = themeColors.has(token);
    if (!inTheme) {
      console.error(`  ✗ --color-${token} missing from @theme inline in globals.css`);
      failed = true;
    } else {
      console.log(`  ✓ ${token.padEnd(18)} in @theme`);
    }
  }

  console.log("\n4. uiColorInk / uiColorFill → semantic class prefixes");
  for (const key of UI_COLOR_INK_KEYS) {
    const value = uiColorInk[key as keyof typeof uiColorInk];
    if (value == null || !value.startsWith("text-")) {
      console.error(`  ✗ uiColorInk.${key} = "${value}" (expected text-* ink)`);
      failed = true;
    } else {
      console.log(`  ✓ ink.${key} → ${value}`);
    }
  }
  for (const key of UI_COLOR_FILL_KEYS) {
    const value = uiColorFill[key as keyof typeof uiColorFill];
    if (value == null || !value.startsWith("bg-")) {
      console.error(`  ✗ uiColorFill.${key} = "${value}" (expected bg-* fill)`);
      failed = true;
    } else {
      console.log(`  ✓ fill.${key} → ${value}`);
    }
  }

  console.log("\n5. Orphan @utility classes (in CSS but not in design-system.ts)");
  let orphanViolations = 0;
  const registeredType = new Set(
    UI_TYPOGRAPHY_UTILITY_KEYS.map((k) => uiTypography[k as keyof typeof uiTypography]),
  );
  const registeredSurface = new Set(
    UI_SURFACE_UTILITY_KEYS.map((k) => uiSurface[k as keyof typeof uiSurface]),
  );
  for (const utility of typeUtilities) {
    if (!registeredType.has(utility)) {
      console.error(`  ✗ @utility ${utility} has no uiTypography entry`);
      orphanViolations++;
      failed = true;
    }
  }
  for (const utility of surfaceUtilities) {
    if (!registeredSurface.has(utility)) {
      console.error(`  ✗ @utility ${utility} has no uiSurface entry`);
      orphanViolations++;
      failed = true;
    }
  }
  if (orphanViolations === 0) {
    console.log("  ✓ no orphan type-* or surface-* utilities");
  }

  console.log("\n6. Banned copy utilities");
  for (const banned of UI_BANNED_TEXT_FILL_UTILITIES) {
    const escaped = banned.replace(/-/g, "\\-");
    if (new RegExp(`@utility\\s+${escaped}\\b`).test(css)) {
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
