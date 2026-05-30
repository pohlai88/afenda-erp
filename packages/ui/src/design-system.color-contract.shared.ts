/**
 * Tailwind v4 color contract — shared by design-system.ts and parity audits.
 *
 * In `@theme inline`, every `--color-{name}` generates `text-{name}`, `bg-{name}`,
 * and `border-{name}`. Shadcn fill tokens alias surface colors; using
 * `text-{fill}` for copy paints with the fill (~94% L), not the ink token.
 *
 * ERP rule: bg-{semantic} + text-{semantic}-foreground, or `type-*` utilities.
 */

/** Theme color names that are surface/fill — never use as `text-{name}` for copy. */
export const UI_COLOR_FILL_TOKENS = [
  "muted",
  "accent",
  "secondary",
  "card",
  "popover",
  "sidebar",
  "background",
  "surface",
  "surface-muted",
  "surface-strong",
  "surface-inset",
  "surface-hover",
  "surface-selected",
  "surface-raised",
  "code-block",
] as const;

/** Tailwind utilities banned for copy color (audit + docs). */
export const UI_BANNED_TEXT_FILL_UTILITIES = UI_COLOR_FILL_TOKENS.map(
  (token) => `text-${token}` as `text-${(typeof UI_COLOR_FILL_TOKENS)[number]}`,
);

/** Regex for fill utilities without `-foreground` suffix — built from fill token registry. */
export function buildBannedTextFillPattern(): RegExp {
  const stems = UI_COLOR_FILL_TOKENS.map((token) =>
    token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  ).join("|");
  return new RegExp(`\\btext-(${stems})(?![\\w-])`, "g");
}

/** @deprecated Use buildBannedTextFillPattern() — kept for importers expecting a constant. */
export const UI_BANNED_TEXT_FILL_PATTERN = buildBannedTextFillPattern();

/** Raw Tailwind palette stems banned in product surfaces (and new usage in @afenda/ui). */
export const UI_RAW_PALETTE_STEMS = [
  "slate",
  "gray",
  "zinc",
  "neutral",
  "stone",
] as const;

export function buildRawPalettePattern(): RegExp {
  const stems = UI_RAW_PALETTE_STEMS.join("|");
  return new RegExp(
    `\\b(bg|text|border|ring|from|to|via|hover:bg|hover:border|hover:text|file:bg)-(${stems})-`,
    "g",
  );
}

/** tw-animate-css classes — allowed only in packages/ui overlay primitives. */
export const UI_TW_ANIMATE_CLASS_PATTERN =
  /\b(?:animate-in|animate-out|fade-in-0|fade-out-0|fade-in|fade-out|zoom-in-95|zoom-out-95|zoom-in-90|zoom-out-90|slide-in-from-|slide-out-to-)/g;

/** Shadcn description drift — product-facing helper slots must use type-* / uiTypography. */
export const UI_PRIMITIVE_DESCRIPTION_DRIFT_PATTERN =
  /\btext-sm(?:\/[\w-]+)?\s+text-muted-foreground\b|\btext-muted-foreground(?:\s|$)/g;

/** Redundant ink when type-* utilities already embed foreground. */
export const UI_REDUNDANT_INK_PATTERN =
  /\btype-(?:muted|caption|label|body|control|code|code-label|mono-cell|mono-muted)\b[^"'`\n]*\btext-muted-foreground\b|\btext-muted-foreground\b[^"'`\n]*\btype-(?:muted|caption|label|body|control|code|code-label|mono-cell|mono-muted)\b/g;

/** uiColorInk / uiColorFill key registries for parity audits. */
export const UI_COLOR_INK_KEYS = [
  "foreground",
  "muted",
  "primary",
  "primaryForeground",
  "secondary",
  "accent",
  "destructive",
  "success",
  "warning",
  "info",
  "critical",
  "codeBlock",
] as const;

export const UI_COLOR_FILL_KEYS = [
  "background",
  "surface",
  "muted",
  "accent",
  "secondary",
  "card",
  "popover",
  "codeBlock",
] as const;

/** `@utility type-*` classes in globals.css — must stay aligned with uiTypography. */
export const UI_TYPOGRAPHY_UTILITY_KEYS = [
  "display",
  "hero",
  "pageTitle",
  "sectionTitle",
  "cardTitle",
  "subtitle",
  "body",
  "muted",
  "caption",
  "label",
  "tableHeader",
  "sectionLabel",
  "control",
  "monoCell",
  "monoMuted",
  "code",
  "codeLabel",
] as const;

export type UiTypographyUtilityKey = (typeof UI_TYPOGRAPHY_UTILITY_KEYS)[number];

/** `@utility surface-*` classes in globals.css — must stay aligned with uiSurface. */
export const UI_SURFACE_UTILITY_KEYS = [
  "page",
  "card",
  "panel",
  "dialog",
  "inset",
  "toolbar",
  "command",
  "section",
  "focus",
  "code",
] as const;

export type UiSurfaceUtilityKey = (typeof UI_SURFACE_UTILITY_KEYS)[number];
