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
  Scatter,
  ScatterChart,
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

import type {
  MetadataUiChart,
  MetadataUiChartSeries,
  MetadataUiChartTone,
} from "../../schemas/chart.schema";

export type MetadataUiRechartsBodyProps = Readonly<{
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

function renderMetadataUiCartesianSeries(
  series: MetadataUiChartSeries,
  chartKind: MetadataUiChart["kind"],
  animationEnabled: boolean,
) {
  const commonProps = {
    dataKey: series.valueKey,
    name: series.label,
    stroke: getMetadataUiChartSeriesColor(series),
    fill: getMetadataUiChartSeriesColor(series),
    stackId: series.stackKey,
    isAnimationActive: animationEnabled,
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

  if (chartKind === "scatter") {
    return (
      <Scatter
        key={series.key}
        dataKey={series.valueKey}
        name={series.label}
        fill={getMetadataUiChartSeriesColor(series)}
        isAnimationActive={animationEnabled}
      />
    );
  }

  return <Bar key={series.key} {...commonProps} radius={3} />;
}

function MetadataUiChartAxes({ chart }: MetadataUiRechartsBodyProps) {
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

function MetadataUiChartOverlay({ chart }: MetadataUiRechartsBodyProps) {
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

function MetadataUiPieChartBody({ chart }: MetadataUiRechartsBodyProps) {
  const [series] = chart.series;
  const animationEnabled = chart.display.reducedMotion === "allow-animation";

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
        isAnimationActive={animationEnabled}
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

function MetadataUiCartesianChartBody({ chart }: MetadataUiRechartsBodyProps) {
  const animationEnabled = chart.display.reducedMotion === "allow-animation";
  const children = (
    <>
      <MetadataUiChartAxes chart={chart} />
      <MetadataUiChartOverlay chart={chart} />
      {chart.series.map((series) =>
        renderMetadataUiCartesianSeries(series, chart.kind, animationEnabled),
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

  if (chart.kind === "scatter") {
    return (
      <ScatterChart accessibilityLayer data={chart.data}>
        {children}
      </ScatterChart>
    );
  }

  return <BarChart accessibilityLayer data={chart.data}>{children}</BarChart>;
}

export function MetadataUiRechartsBody({ chart }: MetadataUiRechartsBodyProps) {
  const config = createMetadataUiChartConfig(chart.series);
  const isPieLike = chart.kind === "pie" || chart.kind === "donut";

  return (
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
  );
}

export default MetadataUiRechartsBody;
