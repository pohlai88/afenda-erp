import { z } from "zod";

import {
  metadataUiActionContractSchema,
  METADATA_UI_ACTION_KEY_SCHEMA,
} from "../contracts/action.contract";
import type { MetadataUiActionContract } from "../contracts/action.contract";
import {
  metadataUiPresentationContractSchema,
} from "../contracts/presentation.contract";
import type { MetadataUiPresentationContract } from "../contracts/presentation.contract";
import {
  metadataUiPermissionContractSchema,
} from "../contracts/permission.contract";
import type { MetadataUiPermissionContract } from "../contracts/permission.contract";

export const METADATA_UI_ACTION_BAR_SCHEMA_ID =
  "metadata-ui.schema.action-bar" as const;

export const METADATA_UI_ACTION_BAR_SCHEMA_VERSION = 1 as const;

export type MetadataUiActionBarSchemaStability = "beta";

export const METADATA_UI_ACTION_BAR_SCHEMA_STABILITY: MetadataUiActionBarSchemaStability =
  "beta";

const METADATA_UI_ACTION_BAR_LAYOUT_VALUES = [
  "inline",
  "toolbar",
  "split",
  "overflow",
  "sticky-footer",
] as const;

const METADATA_UI_ACTION_BAR_ALIGNMENT_VALUES = [
  "start",
  "center",
  "end",
  "between",
] as const;

const METADATA_UI_ACTION_BAR_ITEM_PRIORITY_VALUES = [
  "primary",
  "secondary",
  "tertiary",
  "danger",
] as const;

const METADATA_UI_ACTION_BAR_ITEM_PLACEMENT_VALUES = [
  "main",
  "overflow",
] as const;

const METADATA_UI_ACTION_BAR_DEFAULT_OVERFLOW = {
  enabled: true,
  triggerLabel: "More actions",
} as const;

export const METADATA_UI_ACTION_BAR_KEY_SCHEMA = z
  .string()
  .min(1)
  .max(160)
  .regex(
    /^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/,
    "Action bar keys must use lowercase kebab/dot notation.",
  );

export const METADATA_UI_ACTION_BAR_LAYOUT_SCHEMA = z.enum(
  METADATA_UI_ACTION_BAR_LAYOUT_VALUES,
);

export const METADATA_UI_ACTION_BAR_ALIGNMENT_SCHEMA = z.enum(
  METADATA_UI_ACTION_BAR_ALIGNMENT_VALUES,
);

export const METADATA_UI_ACTION_BAR_OVERFLOW_SCHEMA = z.object({
  enabled: z.boolean().default(true),
  triggerLabel: z.string().min(1).max(80).default("More actions"),
  collapseAfter: z.number().int().min(1).max(12).optional(),
});

export const METADATA_UI_ACTION_BAR_ITEM_SCHEMA = z.object({
  key: METADATA_UI_ACTION_KEY_SCHEMA,

  /**
   * Registry action reference.
   * The full action contract may be supplied for local metadata previews,
   * but production rendering should resolve from the action registry.
   */
  action: metadataUiActionContractSchema.optional(),

  label: z.string().min(1).max(120).optional(),
  description: z.string().min(1).max(240).optional(),

  /**
   * Presentation only.
   * Does not define business permission or workflow policy.
   */
  priority: z
    .enum(METADATA_UI_ACTION_BAR_ITEM_PRIORITY_VALUES)
    .default("secondary"),
  placement: z
    .enum(METADATA_UI_ACTION_BAR_ITEM_PLACEMENT_VALUES)
    .default("main"),

  permission: metadataUiPermissionContractSchema.optional(),

  disabled: z
    .object({
      value: z.boolean(),
      reason: z.string().min(1).max(240).optional(),
    })
    .optional(),

  diagnostics: z
    .object({
      testId: z.string().min(1).max(160).optional(),
      telemetryKey: z.string().min(1).max(160).optional(),
    })
    .optional(),
});

export const METADATA_UI_ACTION_BAR_SCHEMA = z.object({
  schemaId: z.literal(METADATA_UI_ACTION_BAR_SCHEMA_ID).default(
    METADATA_UI_ACTION_BAR_SCHEMA_ID,
  ),
  schemaVersion: z.literal(METADATA_UI_ACTION_BAR_SCHEMA_VERSION).default(
    METADATA_UI_ACTION_BAR_SCHEMA_VERSION,
  ),
  stability: z
    .literal(METADATA_UI_ACTION_BAR_SCHEMA_STABILITY)
    .default(METADATA_UI_ACTION_BAR_SCHEMA_STABILITY),

  key: METADATA_UI_ACTION_BAR_KEY_SCHEMA,

  title: z.string().min(1).max(120).optional(),
  description: z.string().min(1).max(240).optional(),

  layout: METADATA_UI_ACTION_BAR_LAYOUT_SCHEMA.default("toolbar"),
  alignment: METADATA_UI_ACTION_BAR_ALIGNMENT_SCHEMA.default("end"),
  overflow: METADATA_UI_ACTION_BAR_OVERFLOW_SCHEMA.default(
    METADATA_UI_ACTION_BAR_DEFAULT_OVERFLOW,
  ),

  presentation: metadataUiPresentationContractSchema.optional(),
  permission: metadataUiPermissionContractSchema.optional(),

  actions: z.array(METADATA_UI_ACTION_BAR_ITEM_SCHEMA).min(1).max(24),

  diagnostics: z
    .object({
      componentKey: z.string().min(1).max(160).optional(),
      sectionKey: z.string().min(1).max(160).optional(),
      rendererKey: z.string().min(1).max(160).optional(),
      testId: z.string().min(1).max(160).optional(),
    })
    .optional(),
});

type MetadataUiActionBarSchemaOutput = z.output<
  typeof METADATA_UI_ACTION_BAR_SCHEMA
>;
type MetadataUiActionBarItemSchemaOutput = z.output<
  typeof METADATA_UI_ACTION_BAR_ITEM_SCHEMA
>;
type MetadataUiActionBarOverflowSchemaOutput = z.output<
  typeof METADATA_UI_ACTION_BAR_OVERFLOW_SCHEMA
>;

export type MetadataUiActionBarInput = z.input<
  typeof METADATA_UI_ACTION_BAR_SCHEMA
>;
export type MetadataUiActionBarItemInput = z.input<
  typeof METADATA_UI_ACTION_BAR_ITEM_SCHEMA
>;

export type MetadataUiActionBarLayout = z.infer<
  typeof METADATA_UI_ACTION_BAR_LAYOUT_SCHEMA
>;
export type MetadataUiActionBarAlignment = z.infer<
  typeof METADATA_UI_ACTION_BAR_ALIGNMENT_SCHEMA
>;

export type MetadataUiActionBarItemPriority =
  (typeof METADATA_UI_ACTION_BAR_ITEM_PRIORITY_VALUES)[number];

export type MetadataUiActionBarItemPlacement =
  (typeof METADATA_UI_ACTION_BAR_ITEM_PLACEMENT_VALUES)[number];

declare const metadataUiActionBarKeyBrand: unique symbol;
declare const metadataUiActionBarDiagnosticKeyBrand: unique symbol;
declare const metadataUiActionBarNonEmptyActionsBrand: unique symbol;

export type MetadataUiActionBarKey = string & {
  readonly [metadataUiActionBarKeyBrand]: true;
};

export type MetadataUiActionBarKeyFor<
  Namespace extends string,
  Name extends string,
> = `${Lowercase<Namespace>}.${Lowercase<Name>}` & MetadataUiActionBarKey;

export type MetadataUiActionBarDiagnosticKey = string & {
  readonly [metadataUiActionBarDiagnosticKeyBrand]: true;
};

export type MetadataUiActionBarOverflow =
  MetadataUiActionBarOverflowSchemaOutput;

export type MetadataUiActionBarOverflowState = MetadataUiActionBarOverflow;

export type MetadataUiActionBarDisabledState =
  | {
      disabled?: undefined;
    }
  | {
      disabled: {
        value: false;
        reason?: string;
      };
    }
  | {
      disabled: {
        value: true;
        reason?: string;
      };
    };

export type MetadataUiActionBarItemForPlacement<
  Placement extends MetadataUiActionBarItemPlacement,
> = Omit<
  MetadataUiActionBarItemSchemaOutput,
  "action" | "disabled" | "key" | "permission" | "placement"
> &
  MetadataUiActionBarDisabledState & {
    key: MetadataUiActionBarKey;
    action?: MetadataUiActionContract;
    placement: Placement;
    permission?: MetadataUiPermissionContract;
  };

export type MetadataUiActionBarItem =
  | MetadataUiActionBarItemForPlacement<"main">
  | MetadataUiActionBarItemForPlacement<"overflow">;

export type MetadataUiActionBarItemsByPlacement<
  Items extends readonly MetadataUiActionBarItem[],
> = {
  [Placement in MetadataUiActionBarItemPlacement]: Extract<
    Items[number],
    { placement: Placement }
  >[];
};

export type MetadataUiActionBarNonEmptyItems = [
  MetadataUiActionBarItem,
  ...MetadataUiActionBarItem[],
] & {
  readonly [metadataUiActionBarNonEmptyActionsBrand]: true;
};

export type MetadataUiActionBar = Omit<
  MetadataUiActionBarSchemaOutput,
  "actions" | "key" | "overflow" | "permission" | "presentation"
> & {
  key: MetadataUiActionBarKey;
  overflow: MetadataUiActionBarOverflowState;
  presentation?: MetadataUiPresentationContract;
  permission?: MetadataUiPermissionContract;
  actions: MetadataUiActionBarNonEmptyItems;
};

export type MetadataUiActionBarForLayout<
  Layout extends MetadataUiActionBarLayout,
> = MetadataUiActionBar & {
  layout: Layout;
};

export type MetadataUiActionBarParseResult =
  | {
      success: true;
      data: MetadataUiActionBar;
      error?: never;
    }
  | {
      success: false;
      data?: never;
      error: z.ZodError;
    };

function assertMetadataUiActionBarInvariants(
  actionBar: MetadataUiActionBarSchemaOutput,
): asserts actionBar is MetadataUiActionBarSchemaOutput & MetadataUiActionBar {
  if (!/^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/.test(actionBar.key)) {
    throw new Error("Action bar keys must use lowercase kebab/dot notation.");
  }

  if (actionBar.actions.length < 1) {
    throw new Error("Action bars must declare at least one action.");
  }
}

export function parseMetadataUiActionBar(input: unknown): MetadataUiActionBar {
  const actionBar = METADATA_UI_ACTION_BAR_SCHEMA.parse(input);
  assertMetadataUiActionBarInvariants(actionBar);
  return actionBar;
}

export function safeParseMetadataUiActionBar(
  input: unknown,
): MetadataUiActionBarParseResult {
  const result = METADATA_UI_ACTION_BAR_SCHEMA.safeParse(input);
  if (result.success) {
    assertMetadataUiActionBarInvariants(result.data);
    return {
      success: true,
      data: result.data,
    };
  }
  return result;
}
