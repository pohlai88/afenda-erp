import { z } from "zod";

import { metadataUiActionContractSchema } from "../contracts/action.contract";
import type { MetadataUiActionContract } from "../contracts/action.contract";
import { metadataUiPermissionContractSchema } from "../contracts/permission.contract";
import type { MetadataUiPermissionContract } from "../contracts/permission.contract";
import { metadataUiPresentationContractSchema } from "../contracts/presentation.contract";
import type { MetadataUiPresentationContract } from "../contracts/presentation.contract";

export const METADATA_UI_CHART_SCHEMA_ID =
  "metadata-ui.schema.chart" as const;

export const METADATA_UI_CHART_SCHEMA_VERSION = 1 as const;

export type MetadataUiChartSchemaStability = "beta";

export const METADATA_UI_CHART_SCHEMA_STABILITY: MetadataUiChartSchemaStability =
  "beta";

const METADATA_UI_CHART_KIND_VALUES = [
  "bar",
  "line",
  "area",
  "pie",
  "donut",
  "scatter",
  "stacked-bar",
  "composed",
  "heatmap",
] as const;

const METADATA_UI_CHART_TONE_VALUES = [
  "neutral",
  "info",
  "positive",
  "warning",
  "critical",
] as const;

const METADATA_UI_CHART_VALUE_FORMAT_VALUES = [
  "number",
  "currency",
  "percentage",
  "duration",
  "ratio",
  "compact",
  "custom",
] as const;

const METADATA_UI_CHART_LEGEND_POSITION_VALUES = [
  "none",
  "top",
  "bottom",
  "right",
] as const;

const METADATA_UI_CHART_TOOLTIP_MODE_VALUES = [
  "none",
  "compact",
  "detailed",
] as const;

const METADATA_UI_CHART_REDUCED_MOTION_VALUES = [
  "respect-user",
  "always-static",
  "allow-animation",
] as const;

export const METADATA_UI_CHART_KEY_SCHEMA = z
  .string()
  .min(1)
  .max(160)
  .regex(
    /^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/,
    "Chart keys must use lowercase kebab/dot notation.",
  );

export const METADATA_UI_CHART_KIND_SCHEMA = z.enum(
  METADATA_UI_CHART_KIND_VALUES,
);

export const METADATA_UI_CHART_TONE_SCHEMA = z.enum(
  METADATA_UI_CHART_TONE_VALUES,
);

export const METADATA_UI_CHART_VALUE_FORMAT_SCHEMA = z.enum(
  METADATA_UI_CHART_VALUE_FORMAT_VALUES,
);

export const METADATA_UI_CHART_LEGEND_POSITION_SCHEMA = z.enum(
  METADATA_UI_CHART_LEGEND_POSITION_VALUES,
);

export const METADATA_UI_CHART_TOOLTIP_MODE_SCHEMA = z.enum(
  METADATA_UI_CHART_TOOLTIP_MODE_VALUES,
);

export const METADATA_UI_CHART_REDUCED_MOTION_SCHEMA = z.enum(
  METADATA_UI_CHART_REDUCED_MOTION_VALUES,
);

export const METADATA_UI_CHART_AXIS_SCHEMA = z.object({
  key: z.string().min(1).max(120),
  label: z.string().min(1).max(120).optional(),
  format: METADATA_UI_CHART_VALUE_FORMAT_SCHEMA.default("number"),
  hidden: z.boolean().default(false),
});

export const METADATA_UI_CHART_SERIES_SCHEMA = z.object({
  key: METADATA_UI_CHART_KEY_SCHEMA,
  label: z.string().min(1).max(120),
  valueKey: z.string().min(1).max(120),
  tone: METADATA_UI_CHART_TONE_SCHEMA.default("neutral"),
  format: METADATA_UI_CHART_VALUE_FORMAT_SCHEMA.default("number"),
  stackKey: z.string().min(1).max(80).optional(),
  color: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .regex(
      /^(?:#[0-9a-f]{3,8}|hsl\(.*\)|rgb\(.*\)|var\(--[a-z0-9-]+\))$/i,
      "Chart series color must be a hex, rgb(), hsl(), or CSS variable token.",
    )
    .optional(),
});

export const METADATA_UI_CHART_DATUM_SCHEMA = z
  .record(
    z.string().min(1).max(120),
    z.union([z.string(), z.number(), z.boolean(), z.null()]),
  )
  .superRefine((datum, ctx) => {
    if (Object.keys(datum).length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Chart datum must contain at least one field.",
      });
    }
  });

export const METADATA_UI_CHART_DRILLDOWN_SCHEMA = z.object({
  action: metadataUiActionContractSchema,
  permission: metadataUiPermissionContractSchema.optional(),
});

export const METADATA_UI_CHART_ANNOTATION_SCHEMA = z
  .object({
    key: METADATA_UI_CHART_KEY_SCHEMA,
    label: z.string().min(1).max(120),
    description: z.string().min(1).max(320).optional(),
    datumKey: z.string().min(1).max(120).optional(),
    tone: METADATA_UI_CHART_TONE_SCHEMA.default("neutral"),
  })
  .strict();

export const METADATA_UI_CHART_REFERENCE_BAND_SCHEMA = z
  .object({
    key: METADATA_UI_CHART_KEY_SCHEMA,
    label: z.string().min(1).max(120),
    axis: z.enum(["x", "y"]).default("y"),
    from: z.union([z.string(), z.number()]),
    to: z.union([z.string(), z.number()]),
    tone: METADATA_UI_CHART_TONE_SCHEMA.default("neutral"),
  })
  .strict();

export const METADATA_UI_CHART_HEATMAP_SCHEMA = z
  .object({
    xKey: z.string().min(1).max(120),
    yKey: z.string().min(1).max(120),
    valueKey: z.string().min(1).max(120),
    showValues: z.boolean().default(false),
  })
  .strict();

export const METADATA_UI_CHART_TOOLTIP_SCHEMA = z
  .object({
    mode: METADATA_UI_CHART_TOOLTIP_MODE_SCHEMA.default("compact"),
    labelKey: z.string().min(1).max(120).optional(),
    valueFormat: METADATA_UI_CHART_VALUE_FORMAT_SCHEMA.optional(),
    showIndicators: z.boolean().default(true),
  })
  .strict();

const METADATA_UI_CHART_DEFAULT_TOOLTIP = {
  mode: "compact",
  showIndicators: true,
} as const;

const METADATA_UI_CHART_DEFAULT_DISPLAY = {
  height: 320,
  legend: "bottom",
  tooltip: METADATA_UI_CHART_DEFAULT_TOOLTIP,
  reducedMotion: "respect-user",
  tableFallbackLabel: "Chart data table",
} as const;

export const METADATA_UI_CHART_DISPLAY_SCHEMA = z
  .object({
    height: z.number().int().min(180).max(720).default(320),
    legend: METADATA_UI_CHART_LEGEND_POSITION_SCHEMA.default("bottom"),
    tooltip: METADATA_UI_CHART_TOOLTIP_SCHEMA.default(
      METADATA_UI_CHART_DEFAULT_TOOLTIP,
    ),
    reducedMotion: METADATA_UI_CHART_REDUCED_MOTION_SCHEMA.default(
      "respect-user",
    ),
    tableFallbackLabel: z.string().trim().min(1).max(120).default(
      "Chart data table",
    ),
  })
  .strict();

export const METADATA_UI_CHART_SCHEMA = z.object({
  schemaId: z
    .literal(METADATA_UI_CHART_SCHEMA_ID)
    .default(METADATA_UI_CHART_SCHEMA_ID),

  schemaVersion: z
    .literal(METADATA_UI_CHART_SCHEMA_VERSION)
    .default(METADATA_UI_CHART_SCHEMA_VERSION),

  stability: z
    .literal(METADATA_UI_CHART_SCHEMA_STABILITY)
    .default(METADATA_UI_CHART_SCHEMA_STABILITY),

  key: METADATA_UI_CHART_KEY_SCHEMA,

  title: z.string().min(1).max(120).optional(),
  description: z.string().min(1).max(320).optional(),

  kind: METADATA_UI_CHART_KIND_SCHEMA,

  categoryKey: z.string().min(1).max(120),

  xAxis: METADATA_UI_CHART_AXIS_SCHEMA.optional(),
  yAxis: METADATA_UI_CHART_AXIS_SCHEMA.optional(),

  series: z.array(METADATA_UI_CHART_SERIES_SCHEMA).min(1).max(12),

  data: z.array(METADATA_UI_CHART_DATUM_SCHEMA).max(500).default([]),

  display: METADATA_UI_CHART_DISPLAY_SCHEMA.default(
    METADATA_UI_CHART_DEFAULT_DISPLAY,
  ),

  emptyStateKey: METADATA_UI_CHART_KEY_SCHEMA.optional(),

  drilldown: METADATA_UI_CHART_DRILLDOWN_SCHEMA.optional(),

  heatmap: METADATA_UI_CHART_HEATMAP_SCHEMA.optional(),

  annotations: z.array(METADATA_UI_CHART_ANNOTATION_SCHEMA).max(24).default([]),

  referenceBands: z
    .array(METADATA_UI_CHART_REFERENCE_BAND_SCHEMA)
    .max(12)
    .default([]),

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
})
  .strict()
  .superRefine((chart, ctx) => {
    if ((chart.kind === "pie" || chart.kind === "donut") && chart.series.length !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["series"],
        message: "Pie and donut charts must declare exactly one value series.",
      });
    }

    if (chart.kind === "heatmap" && !chart.heatmap) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["heatmap"],
        message: "Heatmap charts must declare heatmap axis metadata.",
      });
    }

    for (const [datumIndex, datum] of chart.data.entries()) {
      if (!(chart.categoryKey in datum)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["data", datumIndex, chart.categoryKey],
          message: "Chart datum must contain the categoryKey field.",
        });
      }

      for (const series of chart.series) {
        if (!(series.valueKey in datum)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["data", datumIndex, series.valueKey],
            message: "Chart datum must contain every series valueKey field.",
          });
        }
      }

      if (chart.heatmap) {
        for (const heatmapKey of [
          chart.heatmap.xKey,
          chart.heatmap.yKey,
          chart.heatmap.valueKey,
        ]) {
          if (!(heatmapKey in datum)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["data", datumIndex, heatmapKey],
              message: "Heatmap chart datum must contain xKey, yKey, and valueKey fields.",
            });
          }
        }
      }
    }
  });

type MetadataUiChartSchemaOutput = z.output<typeof METADATA_UI_CHART_SCHEMA>;

type MetadataUiChartAxisSchemaOutput = z.output<
  typeof METADATA_UI_CHART_AXIS_SCHEMA
>;

type MetadataUiChartSeriesSchemaOutput = z.output<
  typeof METADATA_UI_CHART_SERIES_SCHEMA
>;

type MetadataUiChartDisplaySchemaOutput = z.output<
  typeof METADATA_UI_CHART_DISPLAY_SCHEMA
>;

type MetadataUiChartDrilldownSchemaOutput = z.output<
  typeof METADATA_UI_CHART_DRILLDOWN_SCHEMA
>;

type MetadataUiChartDiagnosticsSchemaOutput = NonNullable<
  MetadataUiChartSchemaOutput["diagnostics"]
>;

export type MetadataUiChartInput = z.input<typeof METADATA_UI_CHART_SCHEMA>;

export type MetadataUiChartAxisInput = z.input<
  typeof METADATA_UI_CHART_AXIS_SCHEMA
>;

export type MetadataUiChartSeriesInput = z.input<
  typeof METADATA_UI_CHART_SERIES_SCHEMA
>;

export type MetadataUiChartDisplayInput = z.input<
  typeof METADATA_UI_CHART_DISPLAY_SCHEMA
>;

export type MetadataUiChartDatumInput = z.input<
  typeof METADATA_UI_CHART_DATUM_SCHEMA
>;

export type MetadataUiChartKind = z.infer<
  typeof METADATA_UI_CHART_KIND_SCHEMA
>;

export type MetadataUiChartTone =
  (typeof METADATA_UI_CHART_TONE_VALUES)[number];

export type MetadataUiChartValueFormat =
  (typeof METADATA_UI_CHART_VALUE_FORMAT_VALUES)[number];

export type MetadataUiChartLegendPosition =
  (typeof METADATA_UI_CHART_LEGEND_POSITION_VALUES)[number];

export type MetadataUiChartTooltipMode =
  (typeof METADATA_UI_CHART_TOOLTIP_MODE_VALUES)[number];

export type MetadataUiChartReducedMotion =
  (typeof METADATA_UI_CHART_REDUCED_MOTION_VALUES)[number];

declare const metadataUiChartKeyBrand: unique symbol;
declare const metadataUiChartFieldKeyBrand: unique symbol;
declare const metadataUiChartDiagnosticKeyBrand: unique symbol;
declare const metadataUiChartBoundedSeriesBrand: unique symbol;
declare const metadataUiChartBoundedDataBrand: unique symbol;

type MetadataUiChartTupleBetween<
  Value,
  Min extends number,
  Max extends number,
  Accumulator extends Value[] = [],
> = Accumulator["length"] extends Max
  ? Accumulator
  : Accumulator["length"] extends Min
    ? Accumulator | MetadataUiChartTupleBetween<Value, Min, Max, [...Accumulator, Value]>
    : MetadataUiChartTupleBetween<Value, Min, Max, [...Accumulator, Value]>;

export type MetadataUiChartKey = string & {
  readonly [metadataUiChartKeyBrand]: true;
};

export type MetadataUiChartKeyFor<
  Namespace extends string,
  Name extends string,
> = `${Lowercase<Namespace>}.${Lowercase<Name>}` & MetadataUiChartKey;

export type MetadataUiChartFieldKey = string & {
  readonly [metadataUiChartFieldKeyBrand]: true;
};

export type MetadataUiChartDiagnosticKey = string & {
  readonly [metadataUiChartDiagnosticKeyBrand]: true;
};

export type MetadataUiChartValue = string | number | boolean | null;

export type MetadataUiChartDatum = Record<
  MetadataUiChartFieldKey,
  MetadataUiChartValue
>;

export type MetadataUiChartAxisForFormat<
  Format extends MetadataUiChartValueFormat,
> = Omit<MetadataUiChartAxisSchemaOutput, "format" | "key"> & {
  key: MetadataUiChartFieldKey;
  format: Format;
};

export type MetadataUiChartAxis = {
  [Format in MetadataUiChartValueFormat]: MetadataUiChartAxisForFormat<Format>;
}[MetadataUiChartValueFormat];

export type MetadataUiChartSeriesForToneAndFormat<
  Tone extends MetadataUiChartTone,
  Format extends MetadataUiChartValueFormat,
> = Omit<
  MetadataUiChartSeriesSchemaOutput,
  "format" | "key" | "tone" | "valueKey"
> & {
  key: MetadataUiChartKey;
  valueKey: MetadataUiChartFieldKey;
  tone: Tone;
  format: Format;
};

export type MetadataUiChartSeries = {
  [Tone in MetadataUiChartTone]: {
    [Format in MetadataUiChartValueFormat]: MetadataUiChartSeriesForToneAndFormat<
      Tone,
      Format
    >;
  }[MetadataUiChartValueFormat];
}[MetadataUiChartTone];

export type MetadataUiChartSeriesByTone<
  Series extends readonly MetadataUiChartSeries[],
> = {
  [Tone in MetadataUiChartTone]: Extract<Series[number], { tone: Tone }>[];
};

export type MetadataUiChartSeriesByFormat<
  Series extends readonly MetadataUiChartSeries[],
> = {
  [Format in MetadataUiChartValueFormat]: Extract<
    Series[number],
    { format: Format }
  >[];
};

export type MetadataUiChartBoundedSeries =
  MetadataUiChartTupleBetween<MetadataUiChartSeries, 1, 12> & {
    readonly [metadataUiChartBoundedSeriesBrand]: true;
  };

export type MetadataUiChartBoundedData =
  MetadataUiChartDatum[] & {
    readonly [metadataUiChartBoundedDataBrand]: true;
  };

export type MetadataUiChartDrilldown = Omit<
  MetadataUiChartDrilldownSchemaOutput,
  "action" | "permission"
> & {
  action: MetadataUiActionContract;
  permission?: MetadataUiPermissionContract;
};

export type MetadataUiChartDisplay = MetadataUiChartDisplaySchemaOutput;

export type MetadataUiChartDiagnostics = Omit<
  MetadataUiChartDiagnosticsSchemaOutput,
  "componentKey" | "rendererKey" | "sectionKey" | "testId"
> & {
  componentKey?: MetadataUiChartDiagnosticKey;
  sectionKey?: MetadataUiChartDiagnosticKey;
  rendererKey?: MetadataUiChartDiagnosticKey;
  testId?: MetadataUiChartDiagnosticKey;
};

export type MetadataUiChart = Omit<
  MetadataUiChartSchemaOutput,
  | "categoryKey"
  | "data"
  | "diagnostics"
  | "display"
  | "drilldown"
  | "emptyStateKey"
  | "key"
  | "permission"
  | "presentation"
  | "series"
  | "xAxis"
  | "yAxis"
> & {
  key: MetadataUiChartKey;
  categoryKey: MetadataUiChartFieldKey;
  xAxis?: MetadataUiChartAxis;
  yAxis?: MetadataUiChartAxis;
  series: MetadataUiChartBoundedSeries;
  data: MetadataUiChartBoundedData;
  display: MetadataUiChartDisplay;
  emptyStateKey?: MetadataUiChartKey;
  drilldown?: MetadataUiChartDrilldown;
  presentation?: MetadataUiPresentationContract;
  permission?: MetadataUiPermissionContract;
  diagnostics?: MetadataUiChartDiagnostics;
};

export type MetadataUiChartForKind<Kind extends MetadataUiChartKind> =
  MetadataUiChart & {
    kind: Kind;
  };

export type MetadataUiChartParseResult =
  | {
      success: true;
      data: MetadataUiChart;
      error?: never;
    }
  | {
      success: false;
      data?: never;
      error: z.ZodError;
    };

function assertMetadataUiChartInvariants(
  chart: MetadataUiChartSchemaOutput,
): asserts chart is MetadataUiChartSchemaOutput & MetadataUiChart {
  if (!/^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/.test(chart.key)) {
    throw new Error("Chart keys must use lowercase kebab/dot notation.");
  }

  if (chart.series.length < 1 || chart.series.length > 12) {
    throw new Error("Charts must declare between one and twelve series.");
  }

  if (chart.data.length > 500) {
    throw new Error("Charts may declare at most five hundred data rows.");
  }
}

export function parseMetadataUiChart(input: unknown): MetadataUiChart {
  const chart = METADATA_UI_CHART_SCHEMA.parse(input);
  assertMetadataUiChartInvariants(chart);
  return chart;
}

export function safeParseMetadataUiChart(
  input: unknown,
): MetadataUiChartParseResult {
  const result = METADATA_UI_CHART_SCHEMA.safeParse(input);
  if (result.success) {
    assertMetadataUiChartInvariants(result.data);
    return {
      success: true,
      data: result.data,
    };
  }
  return result;
}
