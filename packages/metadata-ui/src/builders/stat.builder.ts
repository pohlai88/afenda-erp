import { z } from "zod";

import {
  METADATA_UI_STAT_COMPARISON_SCHEMA,
  METADATA_UI_STAT_ITEM_SCHEMA,
  METADATA_UI_STAT_SCHEMA,
  METADATA_UI_STAT_THRESHOLD_SCHEMA,
  parseMetadataUiStat,
  type MetadataUiStat,
  type MetadataUiStatComparison,
  type MetadataUiStatComparisonForDirection,
  type MetadataUiStatComparisonInput,
  type MetadataUiStatDisplayInput,
  type MetadataUiStatFormat,
  type MetadataUiStatInput,
  type MetadataUiStatItem,
  type MetadataUiStatItemForFormat,
  type MetadataUiStatItemInput,
  type MetadataUiStatLayout,
  type MetadataUiStatThreshold,
  type MetadataUiStatThresholdForTone,
  type MetadataUiStatThresholdInput,
  type MetadataUiStatTone,
  type MetadataUiStatTrendDirection,
} from "../schemas/stat.schema";

type MetadataUiStatSystemFields = "schemaId" | "schemaVersion" | "stability";

export type StatBuilderInput = Omit<
  MetadataUiStatInput,
  MetadataUiStatSystemFields
>;

export type MetadataUiStatBuilderResult<Input extends StatBuilderInput> =
  MetadataUiStat & {
    key: Input["key"];
  } & (Input extends {
    layout?: infer Layout extends MetadataUiStatLayout;
  }
    ? {
        layout: Layout;
      }
    : object);

export type MetadataUiStatItemBuilderResult<
  Input extends MetadataUiStatItemInput,
> = Input extends {
  format?: infer Format extends MetadataUiStatFormat;
}
  ? MetadataUiStatItemForFormat<Format>
  : MetadataUiStatItem;

export type MetadataUiStatComparisonBuilderResult<
  Input extends MetadataUiStatComparisonInput,
> = Input extends {
  direction: infer Direction extends MetadataUiStatTrendDirection;
}
  ? MetadataUiStatComparisonForDirection<Direction>
  : MetadataUiStatComparison;

export type MetadataUiStatThresholdBuilderResult<
  Input extends MetadataUiStatThresholdInput,
> = Input extends {
  tone: infer Tone extends MetadataUiStatTone;
}
  ? MetadataUiStatThresholdForTone<Tone>
  : MetadataUiStatThreshold;

export type MetadataUiStatGroupInput<
  Key extends string = string,
  Items extends readonly MetadataUiStatItemInput[] = MetadataUiStatItemInput[],
> = Omit<
  StatBuilderInput,
  "items" | "key" | "layout"
> & {
  key: Key;
  layout?: "grid";
  items: Items;
};

export type MetadataUiStatItemBasicInput<
  Key extends string = string,
  Label extends string = string,
> = {
  key: Key;
  label: Label;
  value: number | string;
  description?: string;
  unit?: string;
};

export type MetadataUiStatSafeCreateResult<
  Data extends MetadataUiStat = MetadataUiStat,
> =
  | {
      success: true;
      data: Data;
      error?: never;
    }
  | {
      success: false;
      data?: never;
      error: z.ZodError;
    };

export function createStat<const Input extends StatBuilderInput>(
  input: Input,
): MetadataUiStatBuilderResult<Input> {
  return parseMetadataUiStat(input) as MetadataUiStatBuilderResult<Input>;
}

export function createStatGroup<const Input extends MetadataUiStatGroupInput>(
  input: Input,
): MetadataUiStatBuilderResult<Input & { layout: "grid" }> {
  return createStat({
    ...input,
    layout: "grid",
  }) as MetadataUiStatBuilderResult<Input & { layout: "grid" }>;
}

export function createStatItem<const Input extends MetadataUiStatItemInput>(
  input: Input,
): MetadataUiStatItemBuilderResult<Input> {
  return METADATA_UI_STAT_ITEM_SCHEMA.parse(
    input,
  ) as MetadataUiStatItemBuilderResult<Input>;
}

export function createNumberStatItem<
  const Input extends MetadataUiStatItemBasicInput,
>(input: Input): MetadataUiStatItemForFormat<"number"> {
  return createStatItem({
    key: input.key,
    label: input.label,
    description: input.description,
    value: input.value,
    unit: input.unit,
    format: "number",
    tone: "neutral",
    thresholds: [],
  });
}

export function createCurrencyStatItem<
  const Input extends MetadataUiStatItemBasicInput,
>(input: Input): MetadataUiStatItemForFormat<"currency"> {
  return createStatItem({
    key: input.key,
    label: input.label,
    description: input.description,
    value: input.value,
    unit: input.unit,
    format: "currency",
    tone: "neutral",
    thresholds: [],
  });
}

export function createPercentageStatItem<
  const Input extends Omit<MetadataUiStatItemBasicInput, "unit">,
>(input: Input): MetadataUiStatItemForFormat<"percentage"> {
  return createStatItem({
    key: input.key,
    label: input.label,
    description: input.description,
    value: input.value,
    format: "percentage",
    tone: "neutral",
    thresholds: [],
  });
}

export function createCompactStatItem<
  const Input extends Omit<MetadataUiStatItemBasicInput, "unit">,
>(input: Input): MetadataUiStatItemForFormat<"compact"> {
  return createStatItem({
    key: input.key,
    label: input.label,
    description: input.description,
    value: input.value,
    format: "compact",
    tone: "neutral",
    thresholds: [],
  });
}

export function createStatComparison<
  const Input extends MetadataUiStatComparisonInput,
>(input: Input): MetadataUiStatComparisonBuilderResult<Input> {
  return METADATA_UI_STAT_COMPARISON_SCHEMA.parse(
    input,
  ) as MetadataUiStatComparisonBuilderResult<Input>;
}

export function createStatThreshold<
  const Input extends MetadataUiStatThresholdInput,
>(input: Input): MetadataUiStatThresholdBuilderResult<Input> {
  return METADATA_UI_STAT_THRESHOLD_SCHEMA.parse(
    input,
  ) as MetadataUiStatThresholdBuilderResult<Input>;
}

export function withStatItems<const Input extends StatBuilderInput>(
  stat: Input,
  items: MetadataUiStatItemInput[],
): MetadataUiStatBuilderResult<Input> {
  return createStat({
    ...stat,
    items,
  }) as MetadataUiStatBuilderResult<Input>;
}

export function withStatComparison<
  const Input extends MetadataUiStatItemInput,
>(
  item: Input,
  comparison: MetadataUiStatComparisonInput,
): MetadataUiStatItemBuilderResult<Input> {
  return createStatItem({
    ...item,
    comparison,
  }) as MetadataUiStatItemBuilderResult<Input>;
}

export function withStatThresholds<
  const Input extends MetadataUiStatItemInput,
>(
  item: Input,
  thresholds: MetadataUiStatThresholdInput[],
): MetadataUiStatItemBuilderResult<Input> {
  return createStatItem({
    ...item,
    thresholds,
  }) as MetadataUiStatItemBuilderResult<Input>;
}

export function withStatDisplay<
  const Input extends MetadataUiStatItemInput,
>(
  item: Input,
  display: MetadataUiStatDisplayInput,
): MetadataUiStatItemBuilderResult<Input> {
  return createStatItem({
    ...item,
    display,
  }) as MetadataUiStatItemBuilderResult<Input>;
}

export function safeCreateStat(
  input: unknown,
): MetadataUiStatSafeCreateResult {
  const result = METADATA_UI_STAT_SCHEMA.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      error: result.error,
    };
  }

  return {
    success: true,
    data: parseMetadataUiStat(result.data),
  };
}
