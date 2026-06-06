import { z } from "zod";

import {
  METADATA_UI_CHART_DATUM_SCHEMA,
  METADATA_UI_CHART_SCHEMA,
  METADATA_UI_CHART_SERIES_SCHEMA,
  parseMetadataUiChart,
  type MetadataUiChart,
  type MetadataUiChartForKind,
  type MetadataUiChartInput,
  type MetadataUiChartDatum,
  type MetadataUiChartDisplayInput,
  type MetadataUiChartKind,
  type MetadataUiChartSeries,
  type MetadataUiChartSeriesForToneAndFormat,
  type MetadataUiChartSeriesInput,
  type MetadataUiChartTone,
  type MetadataUiChartValueFormat,
  type MetadataUiChartDatumInput,
} from "../schemas/chart.schema";

type MetadataUiChartSystemFields = "schemaId" | "schemaVersion" | "stability";

export type ChartBuilderInput = Omit<
  MetadataUiChartInput,
  MetadataUiChartSystemFields
>;

export type MetadataUiChartBuilderResult<Input extends ChartBuilderInput> =
  Input extends {
    kind: infer Kind extends MetadataUiChartKind;
  }
    ? MetadataUiChartForKind<Kind>
    : MetadataUiChart;

export type MetadataUiChartSeriesBuilderResult<
  Input extends MetadataUiChartSeriesInput,
> = Input extends {
  tone?: infer Tone extends MetadataUiChartTone;
  format?: infer Format extends MetadataUiChartValueFormat;
}
  ? MetadataUiChartSeriesForToneAndFormat<Tone, Format>
  : MetadataUiChartSeries;

export type MetadataUiChartBasicInput<
  Key extends string = string,
  CategoryKey extends string = string,
  Series extends readonly MetadataUiChartSeriesInput[] = MetadataUiChartSeriesInput[],
  Data extends readonly MetadataUiChartDatum[] = MetadataUiChartDatum[],
> = {
  key: Key;
  title?: string;
  description?: string;
  categoryKey: CategoryKey;
  series: Series;
  data?: Data;
};

export type MetadataUiChartSafeCreateResult<
  Data extends MetadataUiChart = MetadataUiChart,
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

export function createChart<const Input extends ChartBuilderInput>(
  input: Input,
): MetadataUiChartBuilderResult<Input> {
  return parseMetadataUiChart(input) as MetadataUiChartBuilderResult<Input>;
}

export function createChartSeries<const Input extends MetadataUiChartSeriesInput>(
  input: Input,
): MetadataUiChartSeriesBuilderResult<Input> {
  return METADATA_UI_CHART_SERIES_SCHEMA.parse(
    input,
  ) as MetadataUiChartSeriesBuilderResult<Input>;
}

export function createBarChart<const Input extends MetadataUiChartBasicInput>(
  input: Input,
): MetadataUiChartForKind<"bar"> {
  return createChart({
    key: input.key,
    kind: "bar",
    title: input.title,
    description: input.description,
    categoryKey: input.categoryKey,
    series: input.series,
    data: input.data ?? [],
  });
}

export function createLineChart<const Input extends MetadataUiChartBasicInput>(
  input: Input,
): MetadataUiChartForKind<"line"> {
  return createChart({
    key: input.key,
    kind: "line",
    title: input.title,
    description: input.description,
    categoryKey: input.categoryKey,
    series: input.series,
    data: input.data ?? [],
  });
}

export function createAreaChart<const Input extends MetadataUiChartBasicInput>(
  input: Input,
): MetadataUiChartForKind<"area"> {
  return createChart({
    key: input.key,
    kind: "area",
    title: input.title,
    description: input.description,
    categoryKey: input.categoryKey,
    series: input.series,
    data: input.data ?? [],
  });
}

export function createPieChart<const Input extends MetadataUiChartBasicInput>(
  input: Input,
): MetadataUiChartForKind<"pie"> {
  return createChart({
    key: input.key,
    kind: "pie",
    title: input.title,
    description: input.description,
    categoryKey: input.categoryKey,
    series: input.series,
    data: input.data ?? [],
  });
}

export function createComposedChart<const Input extends MetadataUiChartBasicInput>(
  input: Input,
): MetadataUiChartForKind<"composed"> {
  return createChart({
    key: input.key,
    kind: "composed",
    title: input.title,
    description: input.description,
    categoryKey: input.categoryKey,
    series: input.series,
    data: input.data ?? [],
  });
}

export function createChartDatum<const Input extends MetadataUiChartDatumInput>(
  input: Input,
): MetadataUiChartDatum {
  return METADATA_UI_CHART_DATUM_SCHEMA.parse(input) as MetadataUiChartDatum;
}

export function withChartData<const Input extends ChartBuilderInput>(
  chart: Input,
  data: MetadataUiChartDatum[],
): MetadataUiChartBuilderResult<Input> {
  return createChart({
    ...chart,
    data,
  } as Input);
}

export function withChartSeries<const Input extends ChartBuilderInput>(
  chart: Input,
  series: MetadataUiChartSeriesInput[],
): MetadataUiChartBuilderResult<Input> {
  return createChart({
    ...chart,
    series,
  } as Input);
}

export function withChartKind<const Kind extends MetadataUiChartKind>(
  chart: MetadataUiChartInput,
  kind: Kind,
): MetadataUiChartForKind<Kind> {
  return createChart({
    ...chart,
    kind,
  });
}

export function withChartDisplay<const Input extends ChartBuilderInput>(
  chart: Input,
  display: MetadataUiChartDisplayInput,
): MetadataUiChartBuilderResult<Input> {
  return createChart({
    ...chart,
    display,
  } as Input);
}

export function appendChartDatum<const Input extends ChartBuilderInput>(
  chart: Input,
  datum: MetadataUiChartDatum,
): MetadataUiChartBuilderResult<Input> {
  return createChart({
    ...chart,
    data: [...(chart.data ?? []), datum],
  } as Input);
}

export function safeCreateChart(
  input: unknown,
): MetadataUiChartSafeCreateResult {
  const result = METADATA_UI_CHART_SCHEMA.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      error: result.error,
    };
  }

  return {
    success: true,
    data: parseMetadataUiChart(result.data),
  };
}
