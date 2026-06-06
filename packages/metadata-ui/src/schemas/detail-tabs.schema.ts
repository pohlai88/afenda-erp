import { z } from "zod";

import { metadataUiActionContractSchema } from "../contracts/action.contract";
import type { MetadataUiActionContract } from "../contracts/action.contract";
import { metadataUiPermissionContractSchema } from "../contracts/permission.contract";
import type { MetadataUiPermissionContract } from "../contracts/permission.contract";
import { metadataUiPresentationContractSchema } from "../contracts/presentation.contract";
import type { MetadataUiPresentationContract } from "../contracts/presentation.contract";

export const METADATA_UI_DETAIL_TABS_SCHEMA_ID =
  "metadata-ui.schema.detail-tabs" as const;

export const METADATA_UI_DETAIL_TABS_SCHEMA_VERSION = 1 as const;

export type MetadataUiDetailTabsSchemaStability = "beta";

export const METADATA_UI_DETAIL_TABS_SCHEMA_STABILITY: MetadataUiDetailTabsSchemaStability =
  "beta";

const METADATA_UI_DETAIL_TAB_KIND_VALUES = [
  "content",
  "audit",
  "activity",
  "attachments",
  "timeline",
  "related-records",
  "custom",
] as const;

const METADATA_UI_DETAIL_TAB_BADGE_TONE_VALUES = [
  "neutral",
  "info",
  "positive",
  "warning",
  "critical",
] as const;

const METADATA_UI_DETAIL_TAB_ACTION_PLACEMENT_VALUES = [
  "header",
  "overflow",
] as const;

export const METADATA_UI_DETAIL_TABS_KEY_SCHEMA = z
  .string()
  .trim()
  .min(1)
  .max(160)
  .regex(
    /^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/,
    "Detail tab keys must use lowercase kebab/dot notation.",
  );

export const METADATA_UI_DETAIL_TAB_KIND_SCHEMA = z.enum(
  METADATA_UI_DETAIL_TAB_KIND_VALUES,
);

export const METADATA_UI_DETAIL_TAB_BADGE_SCHEMA = z.object({
  value: z.union([
    z.string(),
    z.number(),
  ]),
  tone: z
    .enum(METADATA_UI_DETAIL_TAB_BADGE_TONE_VALUES)
    .default("neutral"),
});

export const METADATA_UI_DETAIL_TAB_SCHEMA = z.object({
  key: METADATA_UI_DETAIL_TABS_KEY_SCHEMA,

  label: z.string().trim().min(1).max(120),

  description: z.string().trim().min(1).max(240).optional(),

  kind: METADATA_UI_DETAIL_TAB_KIND_SCHEMA.default("content"),

  badge: METADATA_UI_DETAIL_TAB_BADGE_SCHEMA.optional(),

  /**
   * Registry-resolved section.
   *
   * Metadata UI does not embed renderers directly.
   */
  sectionKey: z.string().trim().min(1).max(160),

  defaultSelected: z.boolean().default(false),

  lazy: z.boolean().default(true),

  permission: metadataUiPermissionContractSchema.optional(),
});

export const METADATA_UI_DETAIL_TAB_ACTION_SCHEMA = z.object({
  action: metadataUiActionContractSchema,

  permission: metadataUiPermissionContractSchema.optional(),

  placement: z
    .enum(METADATA_UI_DETAIL_TAB_ACTION_PLACEMENT_VALUES)
    .default("header"),
});

export const METADATA_UI_DETAIL_TABS_SCHEMA = z.object({
  schemaId: z
    .literal(METADATA_UI_DETAIL_TABS_SCHEMA_ID)
    .default(METADATA_UI_DETAIL_TABS_SCHEMA_ID),

  schemaVersion: z
    .literal(METADATA_UI_DETAIL_TABS_SCHEMA_VERSION)
    .default(METADATA_UI_DETAIL_TABS_SCHEMA_VERSION),

  stability: z
    .literal(METADATA_UI_DETAIL_TABS_SCHEMA_STABILITY)
    .default(METADATA_UI_DETAIL_TABS_SCHEMA_STABILITY),

  key: METADATA_UI_DETAIL_TABS_KEY_SCHEMA,

  title: z.string().trim().min(1).max(120).optional(),

  description: z.string().trim().min(1).max(320).optional(),

  tabs: z
    .array(METADATA_UI_DETAIL_TAB_SCHEMA)
    .min(1)
    .max(20),

  actions: z
    .array(METADATA_UI_DETAIL_TAB_ACTION_SCHEMA)
    .max(8)
    .default([]),

  presentation: metadataUiPresentationContractSchema.optional(),

  permission: metadataUiPermissionContractSchema.optional(),

  diagnostics: z
    .object({
      componentKey: z.string().trim().min(1).max(160).optional(),
      sectionKey: z.string().trim().min(1).max(160).optional(),
      rendererKey: z.string().trim().min(1).max(160).optional(),
      testId: z.string().trim().min(1).max(160).optional(),
    })
    .optional(),
});

type MetadataUiDetailTabsSchemaOutput = z.output<
  typeof METADATA_UI_DETAIL_TABS_SCHEMA
>;

type MetadataUiDetailTabSchemaOutput = z.output<
  typeof METADATA_UI_DETAIL_TAB_SCHEMA
>;

type MetadataUiDetailTabBadgeSchemaOutput = z.output<
  typeof METADATA_UI_DETAIL_TAB_BADGE_SCHEMA
>;

type MetadataUiDetailTabActionSchemaOutput = z.output<
  typeof METADATA_UI_DETAIL_TAB_ACTION_SCHEMA
>;

type MetadataUiDetailTabsDiagnosticsSchemaOutput = NonNullable<
  MetadataUiDetailTabsSchemaOutput["diagnostics"]
>;

export type MetadataUiDetailTabsInput = z.input<
  typeof METADATA_UI_DETAIL_TABS_SCHEMA
>;

export type MetadataUiDetailTabInput = z.input<
  typeof METADATA_UI_DETAIL_TAB_SCHEMA
>;

export type MetadataUiDetailTabActionInput = z.input<
  typeof METADATA_UI_DETAIL_TAB_ACTION_SCHEMA
>;

export type MetadataUiDetailTabKind =
  (typeof METADATA_UI_DETAIL_TAB_KIND_VALUES)[number];

export type MetadataUiDetailTabBadgeTone =
  (typeof METADATA_UI_DETAIL_TAB_BADGE_TONE_VALUES)[number];

export type MetadataUiDetailTabActionPlacement =
  (typeof METADATA_UI_DETAIL_TAB_ACTION_PLACEMENT_VALUES)[number];

declare const metadataUiDetailTabsKeyBrand: unique symbol;
declare const metadataUiDetailTabsSectionKeyBrand: unique symbol;
declare const metadataUiDetailTabsDiagnosticKeyBrand: unique symbol;
declare const metadataUiDetailTabsBoundedTabsBrand: unique symbol;
declare const metadataUiDetailTabsBoundedActionsBrand: unique symbol;

type MetadataUiDetailTabsTupleBetween<
  Value,
  Min extends number,
  Max extends number,
  Accumulator extends Value[] = [],
> = Accumulator["length"] extends Max
  ? Accumulator
  : Accumulator["length"] extends Min
    ? Accumulator | MetadataUiDetailTabsTupleBetween<Value, Min, Max, [...Accumulator, Value]>
    : MetadataUiDetailTabsTupleBetween<Value, Min, Max, [...Accumulator, Value]>;

type MetadataUiDetailTabsTupleUpTo<
  Value,
  Max extends number,
  Accumulator extends Value[] = [],
> = Accumulator["length"] extends Max
  ? Accumulator
  : Accumulator | MetadataUiDetailTabsTupleUpTo<Value, Max, [...Accumulator, Value]>;

export type MetadataUiDetailTabsKey = string & {
  readonly [metadataUiDetailTabsKeyBrand]: true;
};

export type MetadataUiDetailTabsKeyFor<
  Namespace extends string,
  Name extends string,
> = `${Lowercase<Namespace>}.${Lowercase<Name>}` & MetadataUiDetailTabsKey;

export type MetadataUiDetailTabsSectionKey = string & {
  readonly [metadataUiDetailTabsSectionKeyBrand]: true;
};

export type MetadataUiDetailTabsDiagnosticKey = string & {
  readonly [metadataUiDetailTabsDiagnosticKeyBrand]: true;
};

export type MetadataUiDetailTabBadgeForTone<
  Tone extends MetadataUiDetailTabBadgeTone,
> = Omit<MetadataUiDetailTabBadgeSchemaOutput, "tone"> & {
  tone: Tone;
};

export type MetadataUiDetailTabBadge = {
  [Tone in MetadataUiDetailTabBadgeTone]: MetadataUiDetailTabBadgeForTone<Tone>;
}[MetadataUiDetailTabBadgeTone];

export type MetadataUiDetailTabForKind<
  Kind extends MetadataUiDetailTabKind,
> = Omit<
  MetadataUiDetailTabSchemaOutput,
  "badge" | "key" | "kind" | "permission" | "sectionKey"
> & {
  key: MetadataUiDetailTabsKey;
  kind: Kind;
  badge?: MetadataUiDetailTabBadge;
  sectionKey: MetadataUiDetailTabsSectionKey;
  permission?: MetadataUiPermissionContract;
};

export type MetadataUiDetailTab = {
  [Kind in MetadataUiDetailTabKind]: MetadataUiDetailTabForKind<Kind>;
}[MetadataUiDetailTabKind];

export type MetadataUiDetailTabsByKind<
  Tabs extends readonly MetadataUiDetailTab[],
> = {
  [Kind in MetadataUiDetailTabKind]: Extract<Tabs[number], { kind: Kind }>[];
};

export type MetadataUiDetailTabsDefaultSelected<
  Tabs extends readonly MetadataUiDetailTab[],
> = Extract<Tabs[number], { defaultSelected: true }>;

export type MetadataUiDetailTabsBoundedTabs =
  MetadataUiDetailTabsTupleBetween<MetadataUiDetailTab, 1, 20> & {
    readonly [metadataUiDetailTabsBoundedTabsBrand]: true;
  };

export type MetadataUiDetailTabActionForPlacement<
  Placement extends MetadataUiDetailTabActionPlacement,
> = Omit<
  MetadataUiDetailTabActionSchemaOutput,
  "action" | "permission" | "placement"
> & {
  action: MetadataUiActionContract;
  placement: Placement;
  permission?: MetadataUiPermissionContract;
};

export type MetadataUiDetailTabAction = {
  [Placement in MetadataUiDetailTabActionPlacement]: MetadataUiDetailTabActionForPlacement<Placement>;
}[MetadataUiDetailTabActionPlacement];

export type MetadataUiDetailTabActionsByPlacement<
  Actions extends readonly MetadataUiDetailTabAction[],
> = {
  [Placement in MetadataUiDetailTabActionPlacement]: Extract<
    Actions[number],
    { placement: Placement }
  >[];
};

export type MetadataUiDetailTabsBoundedActions =
  MetadataUiDetailTabsTupleUpTo<MetadataUiDetailTabAction, 8> & {
    readonly [metadataUiDetailTabsBoundedActionsBrand]: true;
  };

export type MetadataUiDetailTabsDiagnostics = Omit<
  MetadataUiDetailTabsDiagnosticsSchemaOutput,
  "componentKey" | "rendererKey" | "sectionKey" | "testId"
> & {
  componentKey?: MetadataUiDetailTabsDiagnosticKey;
  sectionKey?: MetadataUiDetailTabsDiagnosticKey;
  rendererKey?: MetadataUiDetailTabsDiagnosticKey;
  testId?: MetadataUiDetailTabsDiagnosticKey;
};

export type MetadataUiDetailTabs = Omit<
  MetadataUiDetailTabsSchemaOutput,
  "actions" | "diagnostics" | "key" | "permission" | "presentation" | "tabs"
> & {
  key: MetadataUiDetailTabsKey;
  tabs: MetadataUiDetailTabsBoundedTabs;
  actions: MetadataUiDetailTabsBoundedActions;
  presentation?: MetadataUiPresentationContract;
  permission?: MetadataUiPermissionContract;
  diagnostics?: MetadataUiDetailTabsDiagnostics;
};

export type MetadataUiDetailTabsParseResult =
  | {
      success: true;
      data: MetadataUiDetailTabs;
      error?: never;
    }
  | {
      success: false;
      data?: never;
      error: z.ZodError;
    };

function assertMetadataUiDetailTabsInvariants(
  detailTabs: MetadataUiDetailTabsSchemaOutput,
): asserts detailTabs is MetadataUiDetailTabsSchemaOutput & MetadataUiDetailTabs {
  if (!/^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/.test(detailTabs.key)) {
    throw new Error("Detail tab keys must use lowercase kebab/dot notation.");
  }

  if (detailTabs.tabs.length < 1 || detailTabs.tabs.length > 20) {
    throw new Error("Detail tabs must declare between one and twenty tabs.");
  }

  if (detailTabs.actions.length > 8) {
    throw new Error("Detail tabs may declare at most eight actions.");
  }

  if (detailTabs.tabs.filter((tab) => tab.defaultSelected).length > 1) {
    throw new Error("Detail tabs may declare at most one default selected tab.");
  }
}

export function parseMetadataUiDetailTabs(
  input: unknown,
): MetadataUiDetailTabs {
  const detailTabs = METADATA_UI_DETAIL_TABS_SCHEMA.parse(input);
  assertMetadataUiDetailTabsInvariants(detailTabs);
  return detailTabs;
}

export function safeParseMetadataUiDetailTabs(
  input: unknown,
): MetadataUiDetailTabsParseResult {
  const result = METADATA_UI_DETAIL_TABS_SCHEMA.safeParse(input);
  if (result.success) {
    assertMetadataUiDetailTabsInvariants(result.data);
    return {
      success: true,
      data: result.data,
    };
  }
  return result;
}
