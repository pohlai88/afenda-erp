"use client";

import { useHydrated } from "@afenda/ui/use-hydrated.client";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Brush,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  ReferenceArea,
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
} from "@afenda/ui/chart";
import { Skeleton } from "@afenda/ui/skeleton";
import { GovernedEmpty } from "./client";
import type {
  ChartAnnotation,
  GovernedChartConfiguration,
} from "./gov-chart-schema";
import { cn } from "@afenda/ui/utils";

import { ChartHeatmapBody } from "./chart-heatmap-body.client";

type ChartRendererBodyProps = {
  configuration: GovernedChartConfiguration;
};

function buildChartConfig(
  series: NonNullable<GovernedChartConfiguration["series"]>,
): ChartConfig {
  return Object.fromEntries(
    series.map((entry, index) => [
      entry.id,
      {
        label: entry.label,
        color: entry.color ?? `var(--chart-${(index % 8) + 1})`,
      },
    ]),
  );
}

function flattenSeries(
  series: NonNullable<GovernedChartConfiguration["series"]>,
): Array<Record<string, string | number>> {
  const byX = new Map<string, Record<string, string | number>>();

  for (const entry of series) {
    for (const point of entry.points) {
      const row = byX.get(point.x) ?? { x: point.x };
      row[entry.id] = point.y;
      byX.set(point.x, row);
    }
  }

  return [...byX.values()];
}

function ReferenceBands({
  bands,
}: {
  bands: NonNullable<GovernedChartConfiguration["referenceBands"]>;
}) {
  return (
    <>
      {bands.map((band) => (
        <ReferenceArea
          key={`${band.label}-${band.yMin}-${band.yMax}`}
          y1={band.yMin}
          y2={band.yMax}
          fill="var(--chart-3)"
          fillOpacity={0.12}
          label={band.label}
        />
      ))}
    </>
  );
}

const ANNOTATION_TONE_CLASS: Record<
  NonNullable<ChartAnnotation["tone"]>,
  string
> = {
  default: "bg-muted text-muted-foreground",
  positive: "bg-success/15 text-success",
  attention: "bg-warning/20 text-warning-foreground",
  critical: "bg-critical/15 text-critical",
};

function ChartAnnotations({
  annotations,
}: {
  annotations?: ChartAnnotation[];
}) {
  if (!annotations?.length) {
    return null;
  }

  return (
    <ul className="flex flex-wrap gap-2 type-caption" aria-label="Chart annotations">
      {annotations.map((annotation) => {
        const tone = annotation.tone ?? "default";
        const coordinate = [annotation.x, annotation.y]
          .filter((value) => value !== undefined)
          .join(" / ");
        return (
          <li
            key={`${annotation.label}-${coordinate}`}
            className={cn(
              "inline-flex items-center gap-1 rounded-control px-2 py-1",
              ANNOTATION_TONE_CLASS[tone],
            )}
          >
            <span aria-hidden>{tone === "default" ? "Note" : tone}</span>
            <span className="type-caption font-medium text-foreground">
              {annotation.label}
            </span>
            {coordinate ? (
              <span className="type-caption">({coordinate})</span>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

export function ChartRendererBody({ configuration }: ChartRendererBodyProps) {
  const hydrated = useHydrated();

  if (!hydrated) {
    return (
      <Skeleton
        aria-hidden
        className="min-h-[12rem] w-full rounded-control" // audit-ds: ignore no-arbitrary-value — chart skeleton minimum height contract
      />
    );
  }

  if (configuration.chartKind === "heatmap") {
    return (
      <div className="flex flex-col gap-3">
        <ChartHeatmapBody configuration={configuration} />
        <ChartAnnotations annotations={configuration.annotations} />
      </div>
    );
  }

  const series = configuration.series ?? [];
  if (series.length === 0) {
    return (
      <GovernedEmpty
        model={
          configuration.empty ?? {
            variant: "muted",
            title: "No chart data",
          }
        }
        className="border-dashed p-6"
      />
    );
  }

  const chartConfig = buildChartConfig(series);
  const data = flattenSeries(series);
  const seriesKeys = series.map((entry) => entry.id);
  const showBrush = configuration.interaction === "brush";
  const referenceBands = configuration.referenceBands ?? [];

  return (
    <div className="flex flex-col gap-3">
      {/* audit-ds: ignore no-arbitrary-value — chart container minimum height contract */}
      <ChartContainer config={chartConfig} className="min-h-[12rem] w-full">
        {configuration.chartKind === "stacked-bar" ? (
          <BarChart data={data} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="x" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={40} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <ReferenceBands bands={referenceBands} />
            {seriesKeys.map((key) => (
              <Bar
                key={key}
                dataKey={key}
                stackId="stack"
                fill={`var(--color-${key})`}
                radius={4}
              />
            ))}
            {showBrush ? (
              <Brush dataKey="x" height={24} stroke="var(--chart-1)" />
            ) : null}
          </BarChart>
        ) : configuration.chartKind === "combo" ? (
          <ComposedChart data={data} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="x" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={40} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <ReferenceBands bands={referenceBands} />
            {series.map((entry) =>
              entry.role === "line" ? (
                <Line
                  key={entry.id}
                  type="monotone"
                  dataKey={entry.id}
                  stroke={`var(--color-${entry.id})`}
                  strokeWidth={2}
                  dot={false}
                />
              ) : (
                <Bar
                  key={entry.id}
                  dataKey={entry.id}
                  fill={`var(--color-${entry.id})`}
                  radius={4}
                />
              ),
            )}
            {showBrush ? (
              <Brush dataKey="x" height={24} stroke="var(--chart-1)" />
            ) : null}
          </ComposedChart>
        ) : configuration.chartKind === "bar" ? (
          <BarChart data={data} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="x" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={40} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <ReferenceBands bands={referenceBands} />
            {seriesKeys.map((key) => (
              <Bar
                key={key}
                dataKey={key}
                fill={`var(--color-${key})`}
                radius={4}
              />
            ))}
            {showBrush ? (
              <Brush dataKey="x" height={24} stroke="var(--chart-1)" />
            ) : null}
          </BarChart>
        ) : configuration.chartKind === "area" ? (
          <AreaChart data={data} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="x" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={40} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <ReferenceBands bands={referenceBands} />
            {seriesKeys.map((key) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={`var(--color-${key})`}
                fill={`var(--color-${key})`}
                fillOpacity={0.25}
              />
            ))}
            {showBrush ? (
              <Brush dataKey="x" height={24} stroke="var(--chart-1)" />
            ) : null}
          </AreaChart>
        ) : (
          <LineChart data={data} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="x" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={40} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <ReferenceBands bands={referenceBands} />
            {seriesKeys.map((key) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={`var(--color-${key})`}
                strokeWidth={2}
                dot={false}
              />
            ))}
            {showBrush ? (
              <Brush dataKey="x" height={24} stroke="var(--chart-1)" />
            ) : null}
          </LineChart>
        )}
      </ChartContainer>
      <ChartAnnotations annotations={configuration.annotations} />
    </div>
  );
}
