import { z } from "zod";

import { metadataUiActionContractSchema } from "../contracts/action.contract";
import type { MetadataUiActionContract } from "../contracts/action.contract";
import { metadataUiPermissionContractSchema } from "../contracts/permission.contract";
import type { MetadataUiPermissionContract } from "../contracts/permission.contract";
import { metadataUiPresentationContractSchema } from "../contracts/presentation.contract";
import type { MetadataUiPresentationContract } from "../contracts/presentation.contract";

export const METADATA_UI_STAT_SCHEMA_ID =
  "metadata-ui.schema.stat" as const;

export const METADATA_UI_STAT_SCHEMA_VERSION = 1 as const;

export type MetadataUiStatSchemaStability = "beta";

export const METADATA_UI_STAT_SCHEMA_STABILITY: MetadataUiStatSchemaStability =
  "beta";

const METADATA_UI_STAT_TONE_VALUES = [
  "neutral",
  "info",
  "positive",
  "warning",
  "critical",
] as const;

const METADATA_UI_STAT_FORMAT_VALUES = [
  "number",
  "currency",
  "percentage",
  "compact",
  "duration",
  "ratio",
  "custom",
] as const;

const METADATA_UI_STAT_ANIMATION_MODE_VALUES = [
  "off",
  "count",
  "respect-user",
] as const;

const METADATA_UI_STAT_TREND_DIRECTION_VALUES = [
  "up",
  "down",
  "flat",
] as const;

const METADATA_UI_STAT_LAYOUT_VALUES = [
  "grid",
  "row",
  "column",
] as const;

export const METADATA_UI_STAT_KEY_SCHEMA = z
  .string()
  .min(1)
  .max(160)
  .regex(
    /^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/,
    "Stat keys must use lowercase kebab/dot notation.",
  );

export const METADATA_UI_STAT_TONE_SCHEMA = z.enum(
  METADATA_UI_STAT_TONE_VALUES,
);

export const METADATA_UI_STAT_FORMAT_SCHEMA = z.enum(
  METADATA_UI_STAT_FORMAT_VALUES,
);

export const METADATA_UI_STAT_ANIMATION_MODE_SCHEMA = z.enum(
  METADATA_UI_STAT_ANIMATION_MODE_VALUES,
);

export const METADATA_UI_STAT_TREND_DIRECTION_SCHEMA = z.enum(
  METADATA_UI_STAT_TREND_DIRECTION_VALUES,
);

export const METADATA_UI_STAT_COMPARISON_SCHEMA = z.object({
  label: z.string().min(1).max(120),

  value: z.union([
    z.number(),
    z.string(),
  ]),

  direction: METADATA_UI_STAT_TREND_DIRECTION_SCHEMA,

  percentageChange: z.number().optional(),

  explanation: z.string().min(1).max(240).optional(),
});

export const METADATA_UI_STAT_THRESHOLD_SCHEMA = z.object({
  key: METADATA_UI_STAT_KEY_SCHEMA,

  minimum: z.number().optional(),
  maximum: z.number().optional(),

  tone: METADATA_UI_STAT_TONE_SCHEMA,

  label: z.string().min(1).max(120).optional(),
});

export const METADATA_UI_STAT_DRILLDOWN_SCHEMA = z.object({
  action: metadataUiActionContractSchema,

  permission: metadataUiPermissionContractSchema.optional(),
});

export const METADATA_UI_STAT_PROGRESS_SCHEMA = z
  .object({
    value: z.number().min(0),
    max: z.number().positive(),
    label: z.string().min(1).max(120).optional(),
  })
  .strict()
  .superRefine((progress, ctx) => {
    if (progress.value > progress.max) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["value"],
        message: "Stat progress value must not exceed max.",
      });
    }
  });

export const METADATA_UI_STAT_SPARK_POINT_SCHEMA = z
  .object({
    value: z.number(),
    label: z.string().min(1).max(120).optional(),
  })
  .strict();

export const METADATA_UI_STAT_DISPLAY_SCHEMA = z
  .object({
    animation: METADATA_UI_STAT_ANIMATION_MODE_SCHEMA.default("respect-user"),
    minimumFractionDigits: z.number().int().min(0).max(6).optional(),
    maximumFractionDigits: z.number().int().min(0).max(6).optional(),
    currency: z.string().trim().length(3).default("USD"),
    locale: z.string().trim().min(2).max(35).optional(),
    iconKey: z.string().trim().min(1).max(80).optional(),
    progress: METADATA_UI_STAT_PROGRESS_SCHEMA.optional(),
    sparkline: z.array(METADATA_UI_STAT_SPARK_POINT_SCHEMA).max(24).default([]),
  })
  .strict()
  .superRefine((display, ctx) => {
    if (
      display.minimumFractionDigits !== undefined &&
      display.maximumFractionDigits !== undefined &&
      display.minimumFractionDigits > display.maximumFractionDigits
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["minimumFractionDigits"],
        message:
          "Minimum fraction digits must not exceed maximum fraction digits.",
      });
    }
  });

export const METADATA_UI_STAT_ITEM_SCHEMA = z.object({
  key: METADATA_UI_STAT_KEY_SCHEMA,

  label: z.string().min(1).max(120),

  description: z.string().min(1).max(240).optional(),

  value: z.union([
    z.number(),
    z.string(),
  ]),

  unit: z.string().min(1).max(32).optional(),

  format: METADATA_UI_STAT_FORMAT_SCHEMA.default("number"),

  display: METADATA_UI_STAT_DISPLAY_SCHEMA.default({
    animation: "respect-user",
    currency: "USD",
    sparkline: [],
  }),

  tone: METADATA_UI_STAT_TONE_SCHEMA.default("neutral"),

  comparison: METADATA_UI_STAT_COMPARISON_SCHEMA.optional(),

  thresholds: z
    .array(METADATA_UI_STAT_THRESHOLD_SCHEMA)
    .max(10)
    .default([]),

  drilldown: METADATA_UI_STAT_DRILLDOWN_SCHEMA.optional(),

  permission: metadataUiPermissionContractSchema.optional(),

  telemetry: z
    .object({
      metricKey: z.string().min(1).max(160),
      source: z.string().min(1).max(160).optional(),
    })
    .optional(),
});

export const METADATA_UI_STAT_LAYOUT_SCHEMA = z.enum(
  METADATA_UI_STAT_LAYOUT_VALUES,
);

export const METADATA_UI_STAT_SCHEMA = z.object({
  schemaId: z
    .literal(METADATA_UI_STAT_SCHEMA_ID)
    .default(METADATA_UI_STAT_SCHEMA_ID),

  schemaVersion: z
    .literal(METADATA_UI_STAT_SCHEMA_VERSION)
    .default(METADATA_UI_STAT_SCHEMA_VERSION),

  stability: z
    .literal(METADATA_UI_STAT_SCHEMA_STABILITY)
    .default(METADATA_UI_STAT_SCHEMA_STABILITY),

  key: METADATA_UI_STAT_KEY_SCHEMA,

  title: z.string().min(1).max(120).optional(),

  description: z.string().min(1).max(320).optional(),

  layout: METADATA_UI_STAT_LAYOUT_SCHEMA.default("grid"),

  items: z
    .array(METADATA_UI_STAT_ITEM_SCHEMA)
    .min(1)
    .max(24),

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

type MetadataUiStatSchemaOutput = z.output<
  typeof METADATA_UI_STAT_SCHEMA
>;

type MetadataUiStatItemSchemaOutput = z.output<
  typeof METADATA_UI_STAT_ITEM_SCHEMA
>;

type MetadataUiStatComparisonSchemaOutput = z.output<
  typeof METADATA_UI_STAT_COMPARISON_SCHEMA
>;

type MetadataUiStatThresholdSchemaOutput = z.output<
  typeof METADATA_UI_STAT_THRESHOLD_SCHEMA
>;

type MetadataUiStatDisplaySchemaOutput = z.output<
  typeof METADATA_UI_STAT_DISPLAY_SCHEMA
>;

type MetadataUiStatDrilldownSchemaOutput = z.output<
  typeof METADATA_UI_STAT_DRILLDOWN_SCHEMA
>;

type MetadataUiStatDiagnosticsSchemaOutput = NonNullable<
  MetadataUiStatSchemaOutput["diagnostics"]
>;

export type MetadataUiStatInput = z.input<typeof METADATA_UI_STAT_SCHEMA>;

export type MetadataUiStatItemInput = z.input<
  typeof METADATA_UI_STAT_ITEM_SCHEMA
>;

export type MetadataUiStatComparisonInput = z.input<
  typeof METADATA_UI_STAT_COMPARISON_SCHEMA
>;

export type MetadataUiStatThresholdInput = z.input<
  typeof METADATA_UI_STAT_THRESHOLD_SCHEMA
>;

export type MetadataUiStatDisplayInput = z.input<
  typeof METADATA_UI_STAT_DISPLAY_SCHEMA
>;

export type MetadataUiStatTone =
  (typeof METADATA_UI_STAT_TONE_VALUES)[number];

export type MetadataUiStatFormat =
  (typeof METADATA_UI_STAT_FORMAT_VALUES)[number];

export type MetadataUiStatAnimationMode =
  (typeof METADATA_UI_STAT_ANIMATION_MODE_VALUES)[number];

export type MetadataUiStatTrendDirection =
  (typeof METADATA_UI_STAT_TREND_DIRECTION_VALUES)[number];

export type MetadataUiStatLayout =
  (typeof METADATA_UI_STAT_LAYOUT_VALUES)[number];

declare const metadataUiStatKeyBrand: unique symbol;
declare const metadataUiStatDiagnosticKeyBrand: unique symbol;
declare const metadataUiStatBoundedItemsBrand: unique symbol;
declare const metadataUiStatBoundedThresholdsBrand: unique symbol;

type MetadataUiStatTupleBetween<
  Value,
  Min extends number,
  Max extends number,
  Accumulator extends Value[] = [],
> = Accumulator["length"] extends Max
  ? Accumulator
  : Accumulator["length"] extends Min
    ? Accumulator | MetadataUiStatTupleBetween<Value, Min, Max, [...Accumulator, Value]>
    : MetadataUiStatTupleBetween<Value, Min, Max, [...Accumulator, Value]>;

type MetadataUiStatTupleUpTo<
  Value,
  Max extends number,
  Accumulator extends Value[] = [],
> = Accumulator["length"] extends Max
  ? Accumulator
  : Accumulator | MetadataUiStatTupleUpTo<Value, Max, [...Accumulator, Value]>;

export type MetadataUiStatKey = string & {
  readonly [metadataUiStatKeyBrand]: true;
};

export type MetadataUiStatKeyFor<
  Namespace extends string,
  Name extends string,
> = `${Lowercase<Namespace>}.${Lowercase<Name>}` & MetadataUiStatKey;

export type MetadataUiStatDiagnosticKey = string & {
  readonly [metadataUiStatDiagnosticKeyBrand]: true;
};

export type MetadataUiStatValue = number | string;

export type MetadataUiStatComparisonForDirection<
  Direction extends MetadataUiStatTrendDirection,
> = Omit<MetadataUiStatComparisonSchemaOutput, "direction"> & {
  direction: Direction;
};

export type MetadataUiStatComparison =
  | MetadataUiStatComparisonForDirection<"up">
  | MetadataUiStatComparisonForDirection<"down">
  | MetadataUiStatComparisonForDirection<"flat">;

export type MetadataUiStatThresholdForTone<
  Tone extends MetadataUiStatTone,
> = Omit<MetadataUiStatThresholdSchemaOutput, "key" | "tone"> & {
  key: MetadataUiStatKey;
  tone: Tone;
};

export type MetadataUiStatThreshold = {
  [Tone in MetadataUiStatTone]: MetadataUiStatThresholdForTone<Tone>;
}[MetadataUiStatTone];

export type MetadataUiStatBoundedThresholds =
  MetadataUiStatTupleUpTo<MetadataUiStatThreshold, 10> & {
    readonly [metadataUiStatBoundedThresholdsBrand]: true;
  };

export type MetadataUiStatDrilldown = Omit<
  MetadataUiStatDrilldownSchemaOutput,
  "action" | "permission"
> & {
  action: MetadataUiActionContract;
  permission?: MetadataUiPermissionContract;
};

export type MetadataUiStatDisplay = MetadataUiStatDisplaySchemaOutput;

export type MetadataUiStatItemForFormat<
  Format extends MetadataUiStatFormat,
> = Omit<
  MetadataUiStatItemSchemaOutput,
  | "comparison"
  | "display"
  | "drilldown"
  | "format"
  | "key"
  | "permission"
  | "thresholds"
> & {
  key: MetadataUiStatKey;
  format: Format;
  display: MetadataUiStatDisplay;
  comparison?: MetadataUiStatComparison;
  thresholds: MetadataUiStatBoundedThresholds;
  drilldown?: MetadataUiStatDrilldown;
  permission?: MetadataUiPermissionContract;
};

export type MetadataUiStatItem = {
  [Format in MetadataUiStatFormat]: MetadataUiStatItemForFormat<Format>;
}[MetadataUiStatFormat];

export type MetadataUiStatItemsByFormat<
  Items extends readonly MetadataUiStatItem[],
> = {
  [Format in MetadataUiStatFormat]: Extract<Items[number], { format: Format }>[];
};

export type MetadataUiStatItemsByTone<
  Items extends readonly MetadataUiStatItem[],
> = {
  [Tone in MetadataUiStatTone]: Extract<Items[number], { tone: Tone }>[];
};

export type MetadataUiStatBoundedItems =
  MetadataUiStatTupleBetween<MetadataUiStatItem, 1, 24> & {
    readonly [metadataUiStatBoundedItemsBrand]: true;
  };

export type MetadataUiStatDiagnostics = Omit<
  MetadataUiStatDiagnosticsSchemaOutput,
  "componentKey" | "rendererKey" | "sectionKey" | "testId"
> & {
  componentKey?: MetadataUiStatDiagnosticKey;
  sectionKey?: MetadataUiStatDiagnosticKey;
  rendererKey?: MetadataUiStatDiagnosticKey;
  testId?: MetadataUiStatDiagnosticKey;
};

export type MetadataUiStat = Omit<
  MetadataUiStatSchemaOutput,
  "diagnostics" | "items" | "key" | "permission" | "presentation"
> & {
  key: MetadataUiStatKey;
  items: MetadataUiStatBoundedItems;
  presentation?: MetadataUiPresentationContract;
  permission?: MetadataUiPermissionContract;
  diagnostics?: MetadataUiStatDiagnostics;
};

export type MetadataUiStatForLayout<Layout extends MetadataUiStatLayout> =
  MetadataUiStat & {
    layout: Layout;
  };

export type MetadataUiStatParseResult =
  | {
      success: true;
      data: MetadataUiStat;
      error?: never;
    }
  | {
      success: false;
      data?: never;
      error: z.ZodError;
    };

function assertMetadataUiStatInvariants(
  stat: MetadataUiStatSchemaOutput,
): asserts stat is MetadataUiStatSchemaOutput & MetadataUiStat {
  if (!/^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/.test(stat.key)) {
    throw new Error("Stat keys must use lowercase kebab/dot notation.");
  }

  if (stat.items.length < 1 || stat.items.length > 24) {
    throw new Error("Stats must declare between one and twenty-four items.");
  }
}

export function parseMetadataUiStat(input: unknown): MetadataUiStat {
  const stat = METADATA_UI_STAT_SCHEMA.parse(input);
  assertMetadataUiStatInvariants(stat);
  return stat;
}

export function safeParseMetadataUiStat(
  input: unknown,
): MetadataUiStatParseResult {
  const result = METADATA_UI_STAT_SCHEMA.safeParse(input);
  if (result.success) {
    assertMetadataUiStatInvariants(result.data);
    return {
      success: true,
      data: result.data,
    };
  }
  return result;
}
