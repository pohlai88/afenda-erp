"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@afenda/ui";
import { cn } from "@afenda/ui/utils";

import type {
  MetadataUiChart,
  MetadataUiChartDatum,
  MetadataUiChartSeries,
  MetadataUiChartTone,
  MetadataUiChartValue,
  MetadataUiChartValueFormat,
} from "../../schemas/chart.schema";

export type MetadataUiChartBodyProps = Readonly<{
  chart: MetadataUiChart;
}>;

const CHART_TONE_COLOR = {
  neutral: "var(--chart-1)",
  info: "var(--chart-2)",
  positive: "var(--chart-3)",
  warning: "var(--chart-4)",
  critical: "var(--chart-5)",
} as const satisfies Record<MetadataUiChartTone, string>;

function getMetadataUiChartSeriesColor(series: MetadataUiChartSeries): string {
  return series.color ?? CHART_TONE_COLOR[series.tone];
}

function createMetadataUiChartConfig(
  series: readonly MetadataUiChartSeries[],
): ChartConfig {
  return Object.fromEntries(
    series.map((item) => [
      item.valueKey,
      {
        label: item.label,
        color: getMetadataUiChartSeriesColor(item),
      },
    ]),
  );
}

function formatMetadataUiChartValue(
  value: MetadataUiChartValue | undefined,
  format: MetadataUiChartValueFormat,
): string {
  if (value === null || value === undefined || typeof value === "boolean") {
    return value == null ? "" : String(value);
  }

  if (typeof value === "string") {
    return value;
  }

  if (format === "currency") {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(value);
  }

  if (format === "percentage") {
    return new Intl.NumberFormat(undefined, {
      style: "percent",
      maximumFractionDigits: 2,
    }).format(value);
  }

  if (format === "compact") {
    return new Intl.NumberFormat(undefined, {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  }

  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
  }).format(value);
}

function renderMetadataUiCartesianSeries(
  series: MetadataUiChartSeries,
  chartKind: MetadataUiChart["kind"],
) {
  const commonProps = {
    dataKey: series.valueKey,
    name: series.label,
    stroke: getMetadataUiChartSeriesColor(series),
    fill: getMetadataUiChartSeriesColor(series),
    stackId: series.stackKey,
    isAnimationActive: false,
  } as const;

  if (chartKind === "line") {
    return (
      <Line
        key={series.key}
        {...commonProps}
        type="monotone"
        strokeWidth={2}
        dot={false}
      />
    );
  }

  if (chartKind === "area") {
    return (
      <Area
        key={series.key}
        {...commonProps}
        type="monotone"
        fillOpacity={0.18}
      />
    );
  }

  if (chartKind === "composed") {
    return series.stackKey ? (
      <Bar key={series.key} {...commonProps} radius={3} />
    ) : (
      <Line
        key={series.key}
        {...commonProps}
        type="monotone"
        strokeWidth={2}
        dot={false}
      />
    );
  }

  return <Bar key={series.key} {...commonProps} radius={3} />;
}

function MetadataUiChartAxes({ chart }: MetadataUiChartBodyProps) {
  return (
    <>
      <CartesianGrid vertical={false} />
      <XAxis
        dataKey={chart.categoryKey}
        tickLine={false}
        axisLine={false}
        tickMargin={8}
        hide={chart.xAxis?.hidden}
      />
      <YAxis
        tickLine={false}
        axisLine={false}
        tickMargin={8}
        hide={chart.yAxis?.hidden}
      />
    </>
  );
}

function MetadataUiChartOverlay({ chart }: MetadataUiChartBodyProps) {
  if (chart.display.tooltip.mode === "none" && chart.display.legend === "none") {
    return null;
  }

  return (
    <>
      {chart.display.tooltip.mode === "none" ? null : (
        <ChartTooltip
          content={
            <ChartTooltipContent
              hideIndicator={!chart.display.tooltip.showIndicators}
              labelKey={chart.display.tooltip.labelKey}
            />
          }
        />
      )}
      {chart.display.legend === "none" ? null : (
        <ChartLegend
          verticalAlign={chart.display.legend === "top" ? "top" : "bottom"}
          align={chart.display.legend === "right" ? "right" : "center"}
          content={<ChartLegendContent />}
        />
      )}
    </>
  );
}

function MetadataUiPieChartBody({ chart }: MetadataUiChartBodyProps) {
  const [series] = chart.series;

  return (
    <PieChart accessibilityLayer>
      <ChartTooltip
        content={
          <ChartTooltipContent
            hideIndicator={!chart.display.tooltip.showIndicators}
            nameKey={chart.categoryKey}
          />
        }
      />
      <Pie
        data={chart.data}
        dataKey={series?.valueKey}
        nameKey={chart.categoryKey}
        innerRadius={chart.kind === "donut" ? 56 : 0}
        outerRadius="80%"
        isAnimationActive={false}
      >
        {chart.data.map((datum, index) => (
          <Cell
            key={`${String(datum[chart.categoryKey])}-${index}`}
            fill={
              chart.series[index]
                ? getMetadataUiChartSeriesColor(chart.series[index])
                : getMetadataUiChartSeriesColor(series)
            }
          />
        ))}
      </Pie>
      {chart.display.legend === "none" ? null : (
        <ChartLegend content={<ChartLegendContent nameKey={chart.categoryKey} />} />
      )}
    </PieChart>
  );
}

function MetadataUiCartesianChartBody({ chart }: MetadataUiChartBodyProps) {
  const children = (
    <>
      <MetadataUiChartAxes chart={chart} />
      <MetadataUiChartOverlay chart={chart} />
      {chart.series.map((series) =>
        renderMetadataUiCartesianSeries(series, chart.kind),
      )}
    </>
  );

  if (chart.kind === "line") {
    return <LineChart accessibilityLayer data={chart.data}>{children}</LineChart>;
  }

  if (chart.kind === "area") {
    return <AreaChart accessibilityLayer data={chart.data}>{children}</AreaChart>;
  }

  if (chart.kind === "composed") {
    return (
      <ComposedChart accessibilityLayer data={chart.data}>
        {children}
      </ComposedChart>
    );
  }

  return <BarChart accessibilityLayer data={chart.data}>{children}</BarChart>;
}

function MetadataUiChartTableFallback({ chart }: MetadataUiChartBodyProps) {
  return (
    <div className="sr-only">
      <table>
        <caption>{chart.display.tableFallbackLabel}</caption>
        <thead>
          <tr>
            <th scope="col">{chart.xAxis?.label ?? chart.categoryKey}</th>
            {chart.series.map((series) => (
              <th key={series.key} scope="col">
                {series.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {chart.data.map((datum: MetadataUiChartDatum, index) => (
            <tr key={`${String(datum[chart.categoryKey])}-${index}`}>
              <th scope="row">{String(datum[chart.categoryKey] ?? "")}</th>
              {chart.series.map((series) => (
                <td key={series.key}>
                  {formatMetadataUiChartValue(
                    datum[series.valueKey],
                    chart.display.tooltip.valueFormat ?? series.format,
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function MetadataUiChartBody({ chart }: MetadataUiChartBodyProps) {
  const config = createMetadataUiChartConfig(chart.series);
  const isPieLike = chart.kind === "pie" || chart.kind === "donut";

  return (
    <div
      className={cn("metadata-ui-chart-body", "min-w-0")}
      data-metadata-ui-chart-kind={chart.kind}
      data-metadata-ui-reduced-motion={chart.display.reducedMotion}
    >
      <ChartContainer
        config={config}
        className="w-full"
        style={{ minHeight: chart.display.height }}
        initialDimension={{
          width: 640,
          height: chart.display.height,
        }}
      >
        {isPieLike ? (
          <MetadataUiPieChartBody chart={chart} />
        ) : (
          <MetadataUiCartesianChartBody chart={chart} />
        )}
      </ChartContainer>
      <MetadataUiChartTableFallback chart={chart} />
    </div>
  );
}
