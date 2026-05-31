import { z } from "zod";

export {
  UI_BANNED_TEXT_FILL_PATTERN,
  UI_BANNED_TEXT_FILL_UTILITIES,
  UI_COLOR_FILL_TOKENS,
  UI_TYPOGRAPHY_UTILITY_KEYS,
  type UiTypographyUtilityKey,
} from "./design-system.color-contract.shared";

/**
 * Enterprise UI contract (not docs).
 *
 * - CSS token source of truth: `apps/erp/src/app/globals.css` via Tailwind v4
 *   `@theme inline` namespaces.
 * - Tailwind still sees literal class strings here → utilities stay generated.
 * - Import these in components instead of inventing new radii in class strings.
 * - Use Zod when variant names come from JSON/CMS/API so invalid values fail at runtime.
 * - Contract lint should reject new hardcoded status colors, arbitrary surface
 *   radii, and non-contract shadows in ERP surfaces.
 * - Preferred API: `ui.*` aliases use familiar primitive names while reusing the
 *   legacy exports below for compatibility.
 * - Spacing: `uiSurfaceSpaceKeys` / `uiSurfaceInset` mirror `apps/erp/src/app/globals.css`
 *   `--space-surface-*` (Tailwind `*-surface-*`).
 */

export const uiPrimitiveKeys = [
  "button",
  "input",
  "badge",
  "card",
  "panel",
  "dialog",
  "popover",
  "sheet",
  "toolbar",
  "table",
  "surface",
  "section",
  "empty",
] as const;

export type UiPrimitive = (typeof uiPrimitiveKeys)[number];

export const uiPrimitiveSchema = z.enum(uiPrimitiveKeys);

/**
 * ERP surface purpose is visual intent only. Runtime and governed builders still
 * own permissions, tenancy, data access, and action authority.
 */
export const uiSurfacePurposeKeys = [
  "directory",
  "workspace",
  "review",
  "audit",
  "execution",
] as const;

export type UiSurfacePurpose = (typeof uiSurfacePurposeKeys)[number];

export const uiSurfacePurposeSchema = z.enum(uiSurfacePurposeKeys);

export const uiSurfacePurposeClasses = {
  directory: "bg-card",
  workspace: "bg-card",
  review: "bg-warning/5 ring-1 ring-warning/25",
  audit: "bg-info/5 ring-1 ring-info/20",
  execution: "bg-primary/5 ring-1 ring-primary/15",
} as const satisfies Record<UiSurfacePurpose, string>;

export const uiOperationalStateKeys = [
  "active",
  "blocked",
  "review",
  "archived",
  "maintenance",
] as const;

export type UiOperationalState = (typeof uiOperationalStateKeys)[number];

export const uiOperationalStateSchema = z.enum(uiOperationalStateKeys);

export const uiOperationalStateClasses = {
  active: "",
  blocked: "ring-1 ring-critical/35",
  review: "ring-1 ring-warning/35",
  archived: "opacity-75",
  maintenance: "ring-1 ring-info/35",
} as const satisfies Record<UiOperationalState, string>;

/** Radius roles — single source for keys + Zod. */
export const uiRadiusKeys = [
  "control",
  "chip",
  "card",
  "panel",
  "dialog",
  "popover",
  "sheet",
  "table",
  "surface",
  "surfaceTop",
  "surfaceBottom",
  "surfaceMediaTop",
  "surfaceMediaBottom",
  "section",
] as const;

export type UiRadiusKey = (typeof uiRadiusKeys)[number];

export const uiRadius = {
  /** Inputs, buttons, triggers, single-line controls */
  control: "rounded-control",
  /** Badges, kbd, compact chips */
  chip: "rounded-chip",
  /** Preferred aliases for familiar UI primitives */
  card: "rounded-card",
  panel: "rounded-panel",
  dialog: "rounded-dialog",
  popover: "rounded-popover",
  sheet: "rounded-sheet",
  table: "rounded-table",
  /** Cards, dialogs, popovers, command surfaces */
  surface: "rounded-surface",
  /** Top / bottom caps for media-in-card patterns */
  surfaceTop: "rounded-t-surface",
  surfaceBottom: "rounded-b-surface",
  /** Full selector utilities for card image caps (Tailwind must see literals) */
  surfaceMediaTop: "*:[img:first-child]:rounded-t-surface",
  surfaceMediaBottom: "*:[img:last-child]:rounded-b-surface",
  /** Accordions, medium grouped shells */
  section: "rounded-section",
} as const satisfies Record<UiRadiusKey, string>;

export const uiRadiusKeySchema = z.enum(uiRadiusKeys);

export const uiRadiusClassSchema = z.enum([
  uiRadius.control,
  uiRadius.chip,
  uiRadius.card,
  uiRadius.panel,
  uiRadius.dialog,
  uiRadius.popover,
  uiRadius.sheet,
  uiRadius.table,
  uiRadius.surface,
  uiRadius.surfaceTop,
  uiRadius.surfaceBottom,
  uiRadius.surfaceMediaTop,
  uiRadius.surfaceMediaBottom,
  uiRadius.section,
]);

export type UiRadiusClass = z.infer<typeof uiRadiusClassSchema>;

export const uiTracking = {
  /** Buttons, fields, dense UI */
  control: "tracking-[0.01em]",
  /** Section labels, legend caps — maps --tracking-label (0.045em) from globals.css */
  label: "tracking-label",
} as const;

/**
 * Vertical rhythm between stacked blocks — mirrors `:root` density tokens in
 * `apps/erp/src/app/globals.css` via Tailwind `gap-density-*` utilities from `@theme inline`.
 */
export const uiDensityKeys = [
  "tight",
  "compact",
  "comfortable",
  "relaxed",
  "loose",
] as const;

export type UiDensity = (typeof uiDensityKeys)[number];

export const uiDensity = {
  tight: "gap-density-tight",
  compact: "gap-density-compact",
  comfortable: "gap-density-comfortable",
  relaxed: "gap-density-relaxed",
  loose: "gap-density-loose",
} as const satisfies Record<UiDensity, string>;

export const uiDensitySchema = z.enum(uiDensityKeys);

/** Keys for `--space-surface-*` in `apps/erp/src/app/globals.css` -> `p-surface-*`, `gap-surface-*`, etc. */
export const uiSurfaceSpaceKeys = [
  "xs",
  "sm",
  "md",
  "lg",
  "xl",
  "2xl",
  "3xl",
] as const;

export type UiSurfaceSpaceKey = (typeof uiSurfaceSpaceKeys)[number];

export const uiSurfaceSpaceSchema = z.enum(uiSurfaceSpaceKeys);

/** Uniform inset per step — use partial axes (`px-surface-*`, `py-surface-*`) when needed */
export const uiSurfaceInset = {
  xs: "p-surface-xs",
  sm: "p-surface-sm",
  md: "p-surface-md",
  lg: "p-surface-lg",
  xl: "p-surface-xl",
  "2xl": "p-surface-2xl",
  "3xl": "p-surface-3xl",
} as const satisfies Record<UiSurfaceSpaceKey, string>;

export const uiSurfaceGap = {
  xs: "gap-surface-xs",
  sm: "gap-surface-sm",
  md: "gap-surface-md",
  lg: "gap-surface-lg",
  xl: "gap-surface-xl",
  "2xl": "gap-surface-2xl",
  "3xl": "gap-surface-3xl",
} as const satisfies Record<UiSurfaceSpaceKey, string>;

/**
 * Semantic heading shortcuts — backed by `type-*` utilities so they participate
 * in the custom type scale (leading-title, tracking-title) rather than Tailwind
 * defaults. Use `uiTypography` for the full palette.
 *
 * sm → type-subtitle      (--text-title-5 / 1.125rem — card/dialog titles)
 * md → type-card-title    (--text-title-4 / 1.25rem  — section subtitles)
 * lg → type-section-title (--text-title-3 / 1.5rem   — section headers)
 */
export const uiTitle = {
  sm: "type-subtitle",
  md: "type-card-title",
  lg: "type-section-title",
} as const;

export const uiText = {
  label: "type-label",
  body: "type-body",
  description: "type-muted",
  /** Inline mono in tables and chips — not block code panels (see uiTypography.code / uiSurface.code). */
  mono: "type-mono-cell",
} as const;

/** Ink tokens — safe for copy color. */
export const uiColorInk = {
  foreground: "text-foreground",
  muted: "text-muted-foreground",
  primary: "text-primary",
  primaryForeground: "text-primary-foreground",
  secondary: "text-secondary-foreground",
  accent: "text-accent-foreground",
  destructive: "text-destructive",
  success: "text-success-foreground",
  warning: "text-warning-foreground",
  info: "text-info-foreground",
  critical: "text-critical-foreground",
  codeBlock: "text-code-block-foreground",
} as const;

/** Fill tokens — surfaces only; pair with uiColorInk for copy on tinted backgrounds. */
export const uiColorFill = {
  background: "bg-background",
  surface: "bg-surface",
  muted: "bg-muted",
  accent: "bg-accent",
  secondary: "bg-secondary",
  card: "bg-card",
  popover: "bg-popover",
  codeBlock: "bg-code-block",
} as const;

/**
 * ERP semantic typography utilities generated by `apps/erp/src/app/globals.css`.
 * These are the preferred contract names for page/list/detail builders.
 * `subtitle` targets card/dialog titles at 1.125rem (--text-title-5).
 */
export const uiTypography = {
  display: "type-display",
  hero: "type-hero",
  pageTitle: "type-page-title",
  sectionTitle: "type-section-title",
  cardTitle: "type-card-title",
  subtitle: "type-subtitle",
  body: "type-body",
  muted: "type-muted",
  caption: "type-caption",
  label: "type-label",
  tableHeader: "type-table-header",
  sectionLabel: "type-section-label",
  control: "type-control",
  monoCell: "type-mono-cell",
  monoMuted: "type-mono-muted",
  code: "type-code",
  codeLabel: "type-code-label",
} as const;

/** Composite surface utilities. Use these before composing raw border/radius/shadow classes. */
export const uiSurface = {
  page: "surface-page",
  card: "surface-card",
  panel: "surface-panel",
  dialog: "surface-dialog",
  inset: "surface-inset",
  toolbar: "surface-toolbar",
  command: "surface-command",
  section: "surface-section",
  focus: "surface-focus",
  code: "surface-code",
} as const;

/**
 * ERP composition hints for agents and audits — see packages/ui/COMPOSITION.md.
 * Prefer shell exports over raw Card stacking in product code.
 */
export const uiComposition = {
  section: "SectionPanel",
  subsection: "SubsectionPanel",
  bulletGrid: "BulletColumns",
  indicatorRow: "ObservabilityIndicatorList",
  statusChip: "StatusBadge",
  empty: "Empty",
  callout: "Alert",
  form: "FieldGroup",
  governedList: "GovernedPatternCListSection",
  docs: "packages/ui/COMPOSITION.md",
} as const;

/** Dense ERP table primitives for metadata-driven list renderers. */
export const uiTable = {
  shell: "table-shell",
  headerRow: "table-header-row",
  headerCell: "table-header-cell",
  cell: "table-cell",
  rowInteractive: "table-row-interactive",
  rowSelected: "table-row-selected",
} as const;

export const uiStatusToneKeys = [
  "neutral",
  "success",
  "warning",
  "info",
  "critical",
] as const;

export type UiStatusTone = (typeof uiStatusToneKeys)[number];
export const uiStatusToneSchema = z.enum(uiStatusToneKeys);

export const uiStatusToneClasses: Record<UiStatusTone, string> = {
  neutral: "bg-muted text-muted-foreground ring-1 ring-border",
  success: "bg-success/15 text-success-foreground",
  warning: "bg-warning/20 text-warning-foreground",
  info: "bg-info/15 text-info-foreground",
  critical: "bg-critical/15 text-critical-foreground",
};

export const uiStatus = {
  neutral: "state-neutral",
  success: "state-success",
  warning: "state-warning",
  info: "state-info",
  critical: "state-critical",
} as const satisfies Record<UiStatusTone, string>;

/** Governed metadata risk tones use product semantics, then map to UI tokens. */
export const uiRiskToneKeys = [
  "default",
  "positive",
  "attention",
  "critical",
] as const;

export type UiRiskTone = (typeof uiRiskToneKeys)[number];

export const uiRiskToneSchema = z.enum(uiRiskToneKeys);

export const uiRiskToneClasses = {
  default: "",
  positive: "bg-success/10 text-success-foreground",
  attention: "bg-warning/10 text-warning-foreground",
  critical: "bg-critical/10 text-critical-foreground",
} as const satisfies Record<UiRiskTone, string>;

export const uiSurfaceMaterialKeys = ["solid", "muted", "subtle"] as const;

export type UiSurfaceMaterial = (typeof uiSurfaceMaterialKeys)[number];

export const uiSurfaceMaterialSchema = z.enum(uiSurfaceMaterialKeys);

export const uiSurfaceMaterial = {
  solid: "bg-card",
  muted: "bg-muted/30",
  subtle: "bg-card/60",
} as const satisfies Record<UiSurfaceMaterial, string>;

export const uiSurfaceElevationKeys = [
  "flat",
  "card",
  "raised",
  "floating",
] as const;

export type UiSurfaceElevation = (typeof uiSurfaceElevationKeys)[number];

const uiSurfaceElevationInputKeys = [
  ...uiSurfaceElevationKeys,
  "default",
] as const;

const uiSurfaceElevationInputSchema = z.enum(uiSurfaceElevationInputKeys);

export const uiSurfaceElevationSchema = uiSurfaceElevationInputSchema.transform(
  (value): UiSurfaceElevation => (value === "default" ? "card" : value),
);

export const uiSurfaceElevation = {
  flat: "shadow-none",
  card: "shadow-elevation-1",
  raised: "shadow-elevation-2",
  floating: "shadow-elevation-3",
  /**
   * @deprecated Use `card`. The schema transforms `"default"` → `"card"` at
   * parse time so this key is never reached via `uiSurfaceElevationSchema`.
   * Retained only for direct object indexing in pre-schema call sites.
   */
  default: "shadow-elevation-1",
} as const;

export const uiFocusRing = {
  default:
    "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-ring",
  strong:
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus-ring-strong",
  inset:
    "focus-visible:outline-none focus-visible:shadow-focus-ring focus-visible:ring-0",
  invalid:
    "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
} as const;

/**
 * Z-index stacking contexts — mirrors `--z-*` tokens in `globals.css`.
 * Import `uiZIndex` in components instead of inventing arbitrary z values.
 */
export const uiZIndexKeys = [
  "base",
  "raised",
  "sidebar",
  "commandbar",
  "overlay",
  "modal",
  "tooltip",
  "toast",
] as const;

export type UiZIndex = (typeof uiZIndexKeys)[number];

export const uiZIndexSchema = z.enum(uiZIndexKeys);

export const uiZIndex = {
  base: "z-base",
  raised: "z-raised",
  sidebar: "z-sidebar",
  commandbar: "z-commandbar",
  overlay: "z-overlay",
  modal: "z-modal",
  tooltip: "z-tooltip",
  toast: "z-toast",
} as const satisfies Record<UiZIndex, string>;

export function parseUiZIndex(value: unknown): UiZIndex {
  return uiZIndexSchema.parse(value);
}

export const uiMotion = {
  interactive:
    "transition-[background-color,border-color,box-shadow,transform] duration-fast ease-enterprise-standard",
  surfaceIn: "animate-surface-in",
  surfaceOut: "animate-surface-out",
  commandIn: "animate-command-in",
  resolving: "animate-material-resolving",
  overlayScrim:
    "data-open:animate-overlay-scrim-in data-closed:animate-overlay-scrim-out",
  overlaySurface:
    "data-open:animate-surface-in data-closed:animate-surface-out",
  overlayTooltip:
    "data-[state=delayed-open]:animate-surface-in data-open:animate-surface-in data-closed:animate-surface-out",
  overlaySheet:
    "data-[side=bottom]:data-open:animate-overlay-sheet-from-bottom data-[side=bottom]:data-closed:animate-overlay-sheet-to-bottom data-[side=top]:data-open:animate-overlay-sheet-from-top data-[side=top]:data-closed:animate-overlay-sheet-to-top data-[side=left]:data-open:animate-overlay-sheet-from-left data-[side=left]:data-closed:animate-overlay-sheet-to-left data-[side=right]:data-open:animate-overlay-sheet-from-right data-[side=right]:data-closed:animate-overlay-sheet-to-right",
  overlayNavViewport:
    "data-open:animate-overlay-nav-viewport-in data-closed:animate-overlay-nav-viewport-out",
  overlayNavMotion:
    "data-[motion=from-end]:animate-overlay-nav-from-end data-[motion=from-start]:animate-overlay-nav-from-start data-[motion=to-end]:animate-overlay-nav-to-end data-[motion=to-start]:animate-overlay-nav-to-start data-[motion^=from-]:animate-overlay-scrim-in data-[motion^=to-]:animate-overlay-scrim-out",
  overlayNavPanel:
    "group-data-[viewport=false]/navigation-menu:data-open:animate-surface-in group-data-[viewport=false]/navigation-menu:data-closed:animate-surface-out",
  overlayIndicator:
    "data-[state=visible]:animate-overlay-scrim-in data-[state=hidden]:animate-overlay-scrim-out",
} as const;

export const uiOverlay = {
  scrim: "bg-scrim supports-backdrop-filter:af-backdrop",
  panel: "bg-overlay supports-backdrop-filter:af-backdrop",
} as const;

export const uiLayout = {
  shell: "mx-auto w-full max-w-shell",
  readable: "mx-auto w-full max-w-readable",
  panel: "mx-auto w-full max-w-panel",
  enterpriseGrid: "af-enterprise-grid",
  pageShell: "page-shell",
  pageStack: "page-stack",
  sectionStack: "section-stack",
  controlRow: "control-row",
  toolbarRow: "toolbar-row",
  splitGrid: "split-grid",
} as const;

export const uiControl = {
  field: "min-h-field px-field-px py-field-py text-sm",
  fieldSm: "h-field-sm px-field-px text-sm",
  menuItem: "px-menu-item-px py-menu-item-py text-sm font-medium",
  tableHead: "h-table-head px-table-cell-px",
  tableCell: "px-table-cell-px py-table-cell-py align-middle",
} as const;

export const uiPriorityKeys = ["low", "normal", "high", "critical"] as const;

export type UiPriority = (typeof uiPriorityKeys)[number];

export const uiPrioritySchema = z.enum(uiPriorityKeys);

export const uiPriorityClasses = {
  low: "priority-low",
  normal: "priority-normal",
  high: "priority-high",
  critical: "priority-critical",
} as const satisfies Record<UiPriority, string>;

export function parseUiPriorityClass(value: unknown): string {
  const key = uiPrioritySchema.parse(value);
  return uiPriorityClasses[key];
}

export const ui = {
  radius: {
    control: uiRadius.control,
    chip: uiRadius.chip,
    card: uiRadius.card,
    panel: uiRadius.panel,
    dialog: uiRadius.dialog,
    popover: uiRadius.popover,
    sheet: uiRadius.sheet,
    table: uiRadius.table,
    surface: uiRadius.surface,
    section: uiRadius.section,
  },
  padding: {
    dense: uiSurfaceInset.sm,
    normal: uiSurfaceInset.md,
    card: uiSurfaceInset.lg,
    roomy: uiSurfaceInset.xl,
    spacious: uiSurfaceInset["2xl"],
  },
  surfaceGap: uiSurfaceGap,
  typography: uiTypography,
  surface: uiSurface,
  table: uiTable,
  gap: {
    tight: uiDensity.tight,
    compact: uiDensity.compact,
    comfortable: uiDensity.comfortable,
    relaxed: uiDensity.relaxed,
    loose: uiDensity.loose,
  },
  elevation: {
    flat: uiSurfaceElevation.flat,
    card: uiSurfaceElevation.card,
    raised: uiSurfaceElevation.raised,
    floating: uiSurfaceElevation.floating,
  },
  material: uiSurfaceMaterial,
  purpose: uiSurfacePurposeClasses,
  tone: uiStatusToneClasses,
  status: uiStatus,
  risk: uiRiskToneClasses,
  text: uiText,
  title: uiTitle,
  focus: uiFocusRing,
  motion: uiMotion,
  overlay: uiOverlay,
  layout: uiLayout,
  control: uiControl,
  priority: uiPriorityClasses,
  state: uiOperationalStateClasses,
  zIndex: uiZIndex,
  color: {
    ink: uiColorInk,
    fill: uiColorFill,
  },
} as const;

export const uiSurfaceContractSchema = z
  .object({
    purpose: uiSurfacePurposeSchema.default("workspace"),
    material: uiSurfaceMaterialSchema.default("solid"),
    elevation: uiSurfaceElevationSchema.default("card"),
    density: uiDensitySchema.default("comfortable"),
    state: uiOperationalStateSchema.default("active"),
  })
  .strict();

export type UiSurfaceContract = z.infer<typeof uiSurfaceContractSchema>;
export type UiSurfaceContractInput = z.input<typeof uiSurfaceContractSchema>;

export function parseUiSurfaceContract(
  value: UiSurfaceContractInput,
): UiSurfaceContract {
  return uiSurfaceContractSchema.parse(value);
}

export function uiSurfaceClass(value: UiSurfaceContractInput = {}): string {
  const contract = parseUiSurfaceContract(value);
  return [
    ui.material[contract.material],
    ui.elevation[contract.elevation],
    ui.purpose[contract.purpose],
    ui.gap[contract.density],
    ui.state[contract.state],
  ]
    .filter(Boolean)
    .join(" ");
}

/** Button variants - keep in sync with `packages/ui/src/button.tsx`. */
export const buttonVariantKeys = [
  "default",
  "outline",
  "secondary",
  "ghost",
  "destructive",
  "link",
] as const;

export type ButtonVariant = (typeof buttonVariantKeys)[number];

export const buttonVariantSchema = z.enum(buttonVariantKeys);

/** Button sizes - keep in sync with `packages/ui/src/button.tsx`. */
export const buttonSizeKeys = [
  "default",
  "xs",
  "sm",
  "lg",
  "icon",
  "icon-xs",
  "icon-sm",
  "icon-lg",
] as const;

export type ButtonSize = (typeof buttonSizeKeys)[number];

export const buttonSizeSchema = z.enum(buttonSizeKeys);

/** Badge variants - keep in sync with `packages/ui/src/badge.tsx`. */
export const badgeVariantKeys = [
  "default",
  "secondary",
  "success",
  "warning",
  "info",
  "critical",
  "destructive",
  "outline",
  "ghost",
  "link",
] as const;

export type BadgeVariant = (typeof badgeVariantKeys)[number];

export const badgeVariantSchema = z.enum(badgeVariantKeys);

/** Card size - keep in sync with `packages/ui/src/card.tsx`. */
export const cardSizeKeys = ["default", "sm"] as const;

export type CardSize = (typeof cardSizeKeys)[number];

export const cardSizeSchema = z.enum(cardSizeKeys);

/**
 * Parse untrusted props / CMS JSON. Example:
 * `buttonVariantSchema.parse(payload.variant)`
 */
export function parseButtonVariant(value: unknown): ButtonVariant {
  return buttonVariantSchema.parse(value);
}

export function parseButtonSize(value: unknown): ButtonSize {
  return buttonSizeSchema.parse(value);
}

export function parseBadgeVariant(value: unknown): BadgeVariant {
  return badgeVariantSchema.parse(value);
}

export function parseCardSize(value: unknown): CardSize {
  return cardSizeSchema.parse(value);
}

export function parseUiPrimitive(value: unknown): UiPrimitive {
  return uiPrimitiveSchema.parse(value);
}

export function parseUiDensity(value: unknown): UiDensity {
  return uiDensitySchema.parse(value);
}

export function parseUiStatusTone(value: unknown): UiStatusTone {
  return uiStatusToneSchema.parse(value);
}

export function parseUiRiskTone(value: unknown): UiRiskTone {
  return uiRiskToneSchema.parse(value);
}

export function parseSurfaceElevation(value: unknown): UiSurfaceElevation {
  return uiSurfaceElevationSchema.parse(value);
}

export function parseUiSurfaceMaterial(value: unknown): UiSurfaceMaterial {
  return uiSurfaceMaterialSchema.parse(value);
}

export function parseUiSurfacePurpose(value: unknown): UiSurfacePurpose {
  return uiSurfacePurposeSchema.parse(value);
}

export function parseUiOperationalState(value: unknown): UiOperationalState {
  return uiOperationalStateSchema.parse(value);
}

export function parseUiRadiusKey(value: unknown): UiRadiusKey {
  return uiRadiusKeySchema.parse(value);
}

export function parseUiRadiusClass(value: unknown): UiRadiusClass {
  return uiRadiusClassSchema.parse(value);
}

export function parseUiSurfaceSpaceKey(value: unknown): UiSurfaceSpaceKey {
  return uiSurfaceSpaceSchema.parse(value);
}

export function parseUiPriority(value: unknown): UiPriority {
  return uiPrioritySchema.parse(value);
}

/* -------------------------------------------------------------------------- */
/* Material semantics — runtime contract                                      */
/*                                                                            */
/* Schemas only. The CSS implementation lives in `apps/erp/src/app/globals.css` and the */
/* adoption contract lives in `.cursor/rules/material-semantics.mdc` +        */
/* ADR-0001 §13. These exports exist so that components consuming `data-phase`*/
/* / `data-lynx` from RouteEnvelope, search params, or server payloads can    */
/* validate against the canonical state machine instead of casting.           */
/*                                                                            */
/* DO NOT export class strings (`.af-material-*`) here — that would invite    */
/* class-swap usage and bypass the `data-phase` driven state machine.         */
/* -------------------------------------------------------------------------- */

/** Canonical material state machine — mirrors ADR-0001 §13.2. */
export const uiMaterialPhaseKeys = [
  "idle",
  "hover",
  "focus",
  "typing",
  "resolving",
  "execution",
  "settled",
] as const;

export type UiMaterialPhase = (typeof uiMaterialPhaseKeys)[number];

export const uiMaterialPhaseSchema = z.enum(uiMaterialPhaseKeys);

export function parseUiMaterialPhase(value: unknown): UiMaterialPhase {
  return uiMaterialPhaseSchema.parse(value);
}

/** Lynx material-aware vocabulary — mirrors ADR-0001 §13.3. */
export const uiLynxStateKeys = [
  "idle",
  "listening",
  "resolving",
  "high-confidence",
  "warning",
  "mismatch",
] as const;

export type UiLynxState = (typeof uiLynxStateKeys)[number];

export const uiLynxStateSchema = z.enum(uiLynxStateKeys);

export function parseUiLynxState(value: unknown): UiLynxState {
  return uiLynxStateSchema.parse(value);
}
