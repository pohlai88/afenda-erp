import { z } from "zod";

import { metadataUiActionContractSchema } from "../contracts/action.contract";
import type { MetadataUiActionContract } from "../contracts/action.contract";
import { metadataUiPermissionContractSchema } from "../contracts/permission.contract";
import type { MetadataUiPermissionContract } from "../contracts/permission.contract";
import { metadataUiPresentationContractSchema } from "../contracts/presentation.contract";
import type { MetadataUiPresentationContract } from "../contracts/presentation.contract";

export const METADATA_UI_PAGE_HEADER_SCHEMA_ID =
  "metadata-ui.schema.page-header" as const;

export const METADATA_UI_PAGE_HEADER_SCHEMA_VERSION = 1 as const;

export type MetadataUiPageHeaderSchemaStability = "beta";

export const METADATA_UI_PAGE_HEADER_SCHEMA_STABILITY: MetadataUiPageHeaderSchemaStability =
  "beta";

const METADATA_UI_PAGE_HEADER_LEVEL_VALUES = [
  "workspace",
  "module",
  "surface",
  "record",
  "dialog",
] as const;

const METADATA_UI_PAGE_HEADER_BADGE_TONE_VALUES = [
  "neutral",
  "info",
  "positive",
  "warning",
  "critical",
] as const;

const METADATA_UI_PAGE_HEADER_ACTION_PLACEMENT_VALUES = [
  "primary",
  "secondary",
  "overflow",
] as const;

export const METADATA_UI_PAGE_HEADER_KEY_SCHEMA = z
  .string()
  .min(1)
  .max(160)
  .regex(
    /^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/,
    "Page header keys must use lowercase kebab/dot notation.",
  );

export const METADATA_UI_PAGE_HEADER_LEVEL_SCHEMA = z.enum(
  METADATA_UI_PAGE_HEADER_LEVEL_VALUES,
);

export const METADATA_UI_PAGE_HEADER_BREADCRUMB_SCHEMA = z.object({
  key: METADATA_UI_PAGE_HEADER_KEY_SCHEMA,
  label: z.string().min(1).max(120),
  href: z.string().min(1).max(300).optional(),
  current: z.boolean().default(false),
});

export const METADATA_UI_PAGE_HEADER_BADGE_SCHEMA = z.object({
  key: METADATA_UI_PAGE_HEADER_KEY_SCHEMA,
  label: z.string().min(1).max(80),
  tone: z
    .enum(METADATA_UI_PAGE_HEADER_BADGE_TONE_VALUES)
    .default("neutral"),
});

export const METADATA_UI_PAGE_HEADER_ACTION_SCHEMA = z.object({
  action: metadataUiActionContractSchema,
  placement: z
    .enum(METADATA_UI_PAGE_HEADER_ACTION_PLACEMENT_VALUES)
    .default("secondary"),
  permission: metadataUiPermissionContractSchema.optional(),
});

export const METADATA_UI_PAGE_HEADER_SCHEMA = z.object({
  schemaId: z
    .literal(METADATA_UI_PAGE_HEADER_SCHEMA_ID)
    .default(METADATA_UI_PAGE_HEADER_SCHEMA_ID),

  schemaVersion: z
    .literal(METADATA_UI_PAGE_HEADER_SCHEMA_VERSION)
    .default(METADATA_UI_PAGE_HEADER_SCHEMA_VERSION),

  stability: z
    .literal(METADATA_UI_PAGE_HEADER_SCHEMA_STABILITY)
    .default(METADATA_UI_PAGE_HEADER_SCHEMA_STABILITY),

  key: METADATA_UI_PAGE_HEADER_KEY_SCHEMA,

  level: METADATA_UI_PAGE_HEADER_LEVEL_SCHEMA.default("surface"),

  eyebrow: z.string().min(1).max(80).optional(),
  title: z.string().min(1).max(160),
  description: z.string().min(1).max(360).optional(),

  breadcrumbs: z
    .array(METADATA_UI_PAGE_HEADER_BREADCRUMB_SCHEMA)
    .max(8)
    .default([]),

  badges: z.array(METADATA_UI_PAGE_HEADER_BADGE_SCHEMA).max(6).default([]),

  actions: z.array(METADATA_UI_PAGE_HEADER_ACTION_SCHEMA).max(8).default([]),

  presentation: metadataUiPresentationContractSchema.optional(),
  permission: metadataUiPermissionContractSchema.optional(),

  diagnostics: z
    .object({
      componentKey: z.string().min(1).max(160).optional(),
      sectionKey: z.string().min(1).max(160).optional(),
      rendererKey: z.string().min(1).max(160).optional(),
      testId: z.string().min(1).max(160).optional(),
    })
    .optional(),
});

type MetadataUiPageHeaderSchemaOutput = z.output<
  typeof METADATA_UI_PAGE_HEADER_SCHEMA
>;

type MetadataUiPageHeaderBreadcrumbSchemaOutput = z.output<
  typeof METADATA_UI_PAGE_HEADER_BREADCRUMB_SCHEMA
>;

type MetadataUiPageHeaderBadgeSchemaOutput = z.output<
  typeof METADATA_UI_PAGE_HEADER_BADGE_SCHEMA
>;

type MetadataUiPageHeaderActionSchemaOutput = z.output<
  typeof METADATA_UI_PAGE_HEADER_ACTION_SCHEMA
>;

type MetadataUiPageHeaderDiagnosticsSchemaOutput = NonNullable<
  MetadataUiPageHeaderSchemaOutput["diagnostics"]
>;

export type MetadataUiPageHeaderInput = z.input<
  typeof METADATA_UI_PAGE_HEADER_SCHEMA
>;

export type MetadataUiPageHeaderBreadcrumbInput = z.input<
  typeof METADATA_UI_PAGE_HEADER_BREADCRUMB_SCHEMA
>;

export type MetadataUiPageHeaderBadgeInput = z.input<
  typeof METADATA_UI_PAGE_HEADER_BADGE_SCHEMA
>;

export type MetadataUiPageHeaderActionInput = z.input<
  typeof METADATA_UI_PAGE_HEADER_ACTION_SCHEMA
>;

export type MetadataUiPageHeaderLevel = z.infer<
  typeof METADATA_UI_PAGE_HEADER_LEVEL_SCHEMA
>;

export type MetadataUiPageHeaderBadgeTone =
  (typeof METADATA_UI_PAGE_HEADER_BADGE_TONE_VALUES)[number];

export type MetadataUiPageHeaderActionPlacement =
  (typeof METADATA_UI_PAGE_HEADER_ACTION_PLACEMENT_VALUES)[number];

declare const metadataUiPageHeaderKeyBrand: unique symbol;
declare const metadataUiPageHeaderDiagnosticKeyBrand: unique symbol;
declare const metadataUiPageHeaderBoundedBreadcrumbsBrand: unique symbol;
declare const metadataUiPageHeaderBoundedBadgesBrand: unique symbol;
declare const metadataUiPageHeaderBoundedActionsBrand: unique symbol;

type MetadataUiPageHeaderTupleUpTo<
  Value,
  Max extends number,
  Accumulator extends Value[] = [],
> = Accumulator["length"] extends Max
  ? Accumulator
  : Accumulator | MetadataUiPageHeaderTupleUpTo<Value, Max, [...Accumulator, Value]>;

export type MetadataUiPageHeaderKey = string & {
  readonly [metadataUiPageHeaderKeyBrand]: true;
};

export type MetadataUiPageHeaderKeyFor<
  Namespace extends string,
  Name extends string,
> = `${Lowercase<Namespace>}.${Lowercase<Name>}` & MetadataUiPageHeaderKey;

export type MetadataUiPageHeaderDiagnosticKey = string & {
  readonly [metadataUiPageHeaderDiagnosticKeyBrand]: true;
};

export type MetadataUiPageHeaderKeyed<Key extends string = string> = {
  key: Key;
};

export type MetadataUiPageHeaderKeyUnion<
  Items extends readonly MetadataUiPageHeaderKeyed<MetadataUiPageHeaderKey>[],
> = Items[number]["key"];

export type MetadataUiPageHeaderBreadcrumb = Omit<
  MetadataUiPageHeaderBreadcrumbSchemaOutput,
  "key"
> & {
  key: MetadataUiPageHeaderKey;
};

export type MetadataUiPageHeaderBadgeForTone<
  Tone extends MetadataUiPageHeaderBadgeTone,
> = Omit<MetadataUiPageHeaderBadgeSchemaOutput, "key" | "tone"> & {
  key: MetadataUiPageHeaderKey;
  tone: Tone;
};

export type MetadataUiPageHeaderBadge =
  | MetadataUiPageHeaderBadgeForTone<"neutral">
  | MetadataUiPageHeaderBadgeForTone<"info">
  | MetadataUiPageHeaderBadgeForTone<"positive">
  | MetadataUiPageHeaderBadgeForTone<"warning">
  | MetadataUiPageHeaderBadgeForTone<"critical">;

export type MetadataUiPageHeaderActionForPlacement<
  Placement extends MetadataUiPageHeaderActionPlacement,
> = Omit<
  MetadataUiPageHeaderActionSchemaOutput,
  "action" | "permission" | "placement"
> & {
  action: MetadataUiActionContract;
  placement: Placement;
  permission?: MetadataUiPermissionContract;
};

export type MetadataUiPageHeaderAction =
  | MetadataUiPageHeaderActionForPlacement<"primary">
  | MetadataUiPageHeaderActionForPlacement<"secondary">
  | MetadataUiPageHeaderActionForPlacement<"overflow">;

export type MetadataUiPageHeaderActionsByPlacement<
  Actions extends readonly MetadataUiPageHeaderAction[],
> = {
  [Placement in MetadataUiPageHeaderActionPlacement]: Extract<
    Actions[number],
    { placement: Placement }
  >[];
};

export type MetadataUiPageHeaderBadgesByTone<
  Badges extends readonly MetadataUiPageHeaderBadge[],
> = {
  [Tone in MetadataUiPageHeaderBadgeTone]: Extract<
    Badges[number],
    { tone: Tone }
  >[];
};

export type MetadataUiPageHeaderCurrentBreadcrumb<
  Breadcrumbs extends readonly MetadataUiPageHeaderBreadcrumb[],
> = Extract<Breadcrumbs[number], { current: true }>;

export type MetadataUiPageHeaderBoundedBreadcrumbs =
  MetadataUiPageHeaderTupleUpTo<MetadataUiPageHeaderBreadcrumb, 8> & {
  readonly [metadataUiPageHeaderBoundedBreadcrumbsBrand]: true;
};

export type MetadataUiPageHeaderBoundedBadges =
  MetadataUiPageHeaderTupleUpTo<MetadataUiPageHeaderBadge, 6> & {
  readonly [metadataUiPageHeaderBoundedBadgesBrand]: true;
};

export type MetadataUiPageHeaderBoundedActions =
  MetadataUiPageHeaderTupleUpTo<MetadataUiPageHeaderAction, 8> & {
  readonly [metadataUiPageHeaderBoundedActionsBrand]: true;
};

export type MetadataUiPageHeaderDiagnostics = Omit<
  MetadataUiPageHeaderDiagnosticsSchemaOutput,
  "componentKey" | "rendererKey" | "sectionKey" | "testId"
> & {
  componentKey?: MetadataUiPageHeaderDiagnosticKey;
  sectionKey?: MetadataUiPageHeaderDiagnosticKey;
  rendererKey?: MetadataUiPageHeaderDiagnosticKey;
  testId?: MetadataUiPageHeaderDiagnosticKey;
};

export type MetadataUiPageHeader = Omit<
  MetadataUiPageHeaderSchemaOutput,
  | "actions"
  | "badges"
  | "breadcrumbs"
  | "diagnostics"
  | "key"
  | "permission"
  | "presentation"
> & {
  key: MetadataUiPageHeaderKey;
  breadcrumbs: MetadataUiPageHeaderBoundedBreadcrumbs;
  badges: MetadataUiPageHeaderBoundedBadges;
  actions: MetadataUiPageHeaderBoundedActions;
  presentation?: MetadataUiPresentationContract;
  permission?: MetadataUiPermissionContract;
  diagnostics?: MetadataUiPageHeaderDiagnostics;
};

export type MetadataUiPageHeaderForLevel<
  Level extends MetadataUiPageHeaderLevel,
> = MetadataUiPageHeader & {
  level: Level;
};

export type MetadataUiPageHeaderParseResult =
  | {
      success: true;
      data: MetadataUiPageHeader;
      error?: never;
    }
  | {
      success: false;
      data?: never;
      error: z.ZodError;
    };

function assertMetadataUiPageHeaderInvariants(
  pageHeader: MetadataUiPageHeaderSchemaOutput,
): asserts pageHeader is MetadataUiPageHeaderSchemaOutput & MetadataUiPageHeader {
  if (!/^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/.test(pageHeader.key)) {
    throw new Error("Page header keys must use lowercase kebab/dot notation.");
  }

  if (pageHeader.breadcrumbs.length > 8) {
    throw new Error("Page headers may declare at most eight breadcrumbs.");
  }

  if (pageHeader.badges.length > 6) {
    throw new Error("Page headers may declare at most six badges.");
  }

  if (pageHeader.actions.length > 8) {
    throw new Error("Page headers may declare at most eight actions.");
  }
}

export function parseMetadataUiPageHeader(
  input: unknown,
): MetadataUiPageHeader {
  const pageHeader = METADATA_UI_PAGE_HEADER_SCHEMA.parse(input);
  assertMetadataUiPageHeaderInvariants(pageHeader);
  return pageHeader;
}

export function safeParseMetadataUiPageHeader(
  input: unknown,
): MetadataUiPageHeaderParseResult {
  const result = METADATA_UI_PAGE_HEADER_SCHEMA.safeParse(input);
  if (result.success) {
    assertMetadataUiPageHeaderInvariants(result.data);
    return {
      success: true,
      data: result.data,
    };
  }
  return result;
}
