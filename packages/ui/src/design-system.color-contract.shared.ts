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
export const UI_BANNED_TEXT_FILL_UTILITIES = [
  "text-muted",
  "text-accent",
  "text-secondary",
  "text-card",
  "text-popover",
] as const;

/** Regex stem for audit — matches fill utilities without `-foreground` suffix. */
export const UI_BANNED_TEXT_FILL_PATTERN =
  /\btext-(muted|accent|secondary|card|popover)(?![\w-])/g;

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
