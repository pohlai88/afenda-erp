import { z } from "zod";

import { metadataUiActionContractSchema } from "../contracts/action.contract";
import type { MetadataUiActionContract } from "../contracts/action.contract";
import { metadataUiPermissionContractSchema } from "../contracts/permission.contract";
import type { MetadataUiPermissionContract } from "../contracts/permission.contract";
import { metadataUiPresentationContractSchema } from "../contracts/presentation.contract";
import type { MetadataUiPresentationContract } from "../contracts/presentation.contract";

export const METADATA_UI_EMPTY_STATE_SCHEMA_ID =
  "metadata-ui.schema.empty-state" as const;

export const METADATA_UI_EMPTY_STATE_SCHEMA_VERSION = 1 as const;

export type MetadataUiEmptyStateSchemaStability = "beta";

export const METADATA_UI_EMPTY_STATE_SCHEMA_STABILITY: MetadataUiEmptyStateSchemaStability =
  "beta";

const METADATA_UI_EMPTY_STATE_KIND_VALUES = [
  "empty",
  "no-results",
  "forbidden",
  "error",
  "not-configured",
  "not-available",
] as const;

const METADATA_UI_EMPTY_STATE_TONE_VALUES = [
  "neutral",
  "info",
  "positive",
  "warning",
  "critical",
] as const;

const METADATA_UI_EMPTY_STATE_ACTION_PLACEMENT_VALUES = [
  "primary",
  "secondary",
  "link",
] as const;

export const METADATA_UI_EMPTY_STATE_KEY_SCHEMA = z
  .string()
  .trim()
  .min(1)
  .max(160)
  .regex(
    /^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/,
    "Empty state keys must use lowercase kebab/dot notation.",
  );

export const METADATA_UI_EMPTY_STATE_KIND_SCHEMA = z.enum(
  METADATA_UI_EMPTY_STATE_KIND_VALUES,
);

export const METADATA_UI_EMPTY_STATE_TONE_SCHEMA = z.enum(
  METADATA_UI_EMPTY_STATE_TONE_VALUES,
);

export const METADATA_UI_EMPTY_STATE_ILLUSTRATION_SCHEMA = z.object({
  key: METADATA_UI_EMPTY_STATE_KEY_SCHEMA,
  label: z.string().trim().min(1).max(120).optional(),
  decorative: z.boolean().default(true),
});

export const METADATA_UI_EMPTY_STATE_ACTION_SCHEMA = z.object({
  action: metadataUiActionContractSchema,
  permission: metadataUiPermissionContractSchema.optional(),
  placement: z
    .enum(METADATA_UI_EMPTY_STATE_ACTION_PLACEMENT_VALUES)
    .default("primary"),
});

export const METADATA_UI_EMPTY_STATE_SCHEMA = z.object({
  schemaId: z
    .literal(METADATA_UI_EMPTY_STATE_SCHEMA_ID)
    .default(METADATA_UI_EMPTY_STATE_SCHEMA_ID),

  schemaVersion: z
    .literal(METADATA_UI_EMPTY_STATE_SCHEMA_VERSION)
    .default(METADATA_UI_EMPTY_STATE_SCHEMA_VERSION),

  stability: z
    .literal(METADATA_UI_EMPTY_STATE_SCHEMA_STABILITY)
    .default(METADATA_UI_EMPTY_STATE_SCHEMA_STABILITY),

  key: METADATA_UI_EMPTY_STATE_KEY_SCHEMA,

  kind: METADATA_UI_EMPTY_STATE_KIND_SCHEMA.default("empty"),
  tone: METADATA_UI_EMPTY_STATE_TONE_SCHEMA.default("neutral"),

  title: z.string().trim().min(1).max(140),
  description: z.string().trim().min(1).max(320).optional(),

  illustration: METADATA_UI_EMPTY_STATE_ILLUSTRATION_SCHEMA.optional(),

  actions: z.array(METADATA_UI_EMPTY_STATE_ACTION_SCHEMA).max(3).default([]),

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

type MetadataUiEmptyStateSchemaOutput = z.output<
  typeof METADATA_UI_EMPTY_STATE_SCHEMA
>;

type MetadataUiEmptyStateActionSchemaOutput = z.output<
  typeof METADATA_UI_EMPTY_STATE_ACTION_SCHEMA
>;

type MetadataUiEmptyStateIllustrationSchemaOutput = z.output<
  typeof METADATA_UI_EMPTY_STATE_ILLUSTRATION_SCHEMA
>;

export type MetadataUiEmptyStateInput = z.input<
  typeof METADATA_UI_EMPTY_STATE_SCHEMA
>;

export type MetadataUiEmptyStateActionInput = z.input<
  typeof METADATA_UI_EMPTY_STATE_ACTION_SCHEMA
>;

export type MetadataUiEmptyStateKind = z.infer<
  typeof METADATA_UI_EMPTY_STATE_KIND_SCHEMA
>;

export type MetadataUiEmptyStateTone = z.infer<
  typeof METADATA_UI_EMPTY_STATE_TONE_SCHEMA
>;

export type MetadataUiEmptyStateActionPlacement =
  (typeof METADATA_UI_EMPTY_STATE_ACTION_PLACEMENT_VALUES)[number];

declare const metadataUiEmptyStateKeyBrand: unique symbol;
declare const metadataUiEmptyStateDiagnosticKeyBrand: unique symbol;
declare const metadataUiEmptyStateBoundedActionsBrand: unique symbol;

export type MetadataUiEmptyStateKey = string & {
  readonly [metadataUiEmptyStateKeyBrand]: true;
};

export type MetadataUiEmptyStateKeyFor<
  Namespace extends string,
  Name extends string,
> = `${Lowercase<Namespace>}.${Lowercase<Name>}` & MetadataUiEmptyStateKey;

export type MetadataUiEmptyStateDiagnosticKey = string & {
  readonly [metadataUiEmptyStateDiagnosticKeyBrand]: true;
};

export type MetadataUiEmptyStateIllustration = Omit<
  MetadataUiEmptyStateIllustrationSchemaOutput,
  "key"
> & {
  key: MetadataUiEmptyStateKey;
};

export type MetadataUiEmptyStateActionForPlacement<
  Placement extends MetadataUiEmptyStateActionPlacement,
> = Omit<
  MetadataUiEmptyStateActionSchemaOutput,
  "action" | "permission" | "placement"
> & {
  action: MetadataUiActionContract;
  permission?: MetadataUiPermissionContract;
  placement: Placement;
};

export type MetadataUiEmptyStateAction =
  | MetadataUiEmptyStateActionForPlacement<"primary">
  | MetadataUiEmptyStateActionForPlacement<"secondary">
  | MetadataUiEmptyStateActionForPlacement<"link">;

export type MetadataUiEmptyStateActionsByPlacement<
  Actions extends readonly MetadataUiEmptyStateAction[],
> = {
  [Placement in MetadataUiEmptyStateActionPlacement]: Extract<
    Actions[number],
    { placement: Placement }
  >[];
};

export type MetadataUiEmptyStateBoundedActions =
  | []
  | [MetadataUiEmptyStateAction]
  | [MetadataUiEmptyStateAction, MetadataUiEmptyStateAction]
  | [
      MetadataUiEmptyStateAction,
      MetadataUiEmptyStateAction,
      MetadataUiEmptyStateAction,
    ];

export type MetadataUiEmptyStateActions = MetadataUiEmptyStateBoundedActions & {
  readonly [metadataUiEmptyStateBoundedActionsBrand]: true;
};

export type MetadataUiEmptyStateForKind<
  Kind extends MetadataUiEmptyStateKind,
> = MetadataUiEmptyState & {
  kind: Kind;
};

export type MetadataUiEmptyState = Omit<
  MetadataUiEmptyStateSchemaOutput,
  "actions" | "illustration" | "key" | "permission" | "presentation"
> & {
  key: MetadataUiEmptyStateKey;
  illustration?: MetadataUiEmptyStateIllustration;
  actions: MetadataUiEmptyStateActions;
  presentation?: MetadataUiPresentationContract;
  permission?: MetadataUiPermissionContract;
};

export type MetadataUiEmptyStateParseResult =
  | {
      success: true;
      data: MetadataUiEmptyState;
      error?: never;
    }
  | {
      success: false;
      data?: never;
      error: z.ZodError;
    };

function assertMetadataUiEmptyStateInvariants(
  emptyState: MetadataUiEmptyStateSchemaOutput,
): asserts emptyState is MetadataUiEmptyStateSchemaOutput & MetadataUiEmptyState {
  if (!/^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/.test(emptyState.key)) {
    throw new Error("Empty state keys must use lowercase kebab/dot notation.");
  }

  if (emptyState.actions.length > 3) {
    throw new Error("Empty states may declare at most three actions.");
  }
}

export function parseMetadataUiEmptyState(input: unknown): MetadataUiEmptyState {
  const emptyState = METADATA_UI_EMPTY_STATE_SCHEMA.parse(input);
  assertMetadataUiEmptyStateInvariants(emptyState);
  return emptyState;
}

export function safeParseMetadataUiEmptyState(
  input: unknown,
): MetadataUiEmptyStateParseResult {
  const result = METADATA_UI_EMPTY_STATE_SCHEMA.safeParse(input);
  if (result.success) {
    assertMetadataUiEmptyStateInvariants(result.data);
    return {
      success: true,
      data: result.data,
    };
  }
  return result;
}
