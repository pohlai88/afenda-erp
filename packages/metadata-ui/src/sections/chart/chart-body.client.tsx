"use client";

import { lazy, Suspense } from "react";
import { cn } from "@afenda/ui/utils";

import type {
  MetadataUiChart,
  MetadataUiChartDatum,
  MetadataUiChartValue,
  MetadataUiChartValueFormat,
} from "../../schemas/chart.schema";

export type MetadataUiChartBodyProps = Readonly<{
  chart: MetadataUiChart;
}>;

const MetadataUiRechartsBody = lazy(() =>
  import("./chart-recharts.client").then((module) => ({
    default: module.MetadataUiRechartsBody,
  })),
);

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

function readMetadataUiChartDatumValue(
  datum: MetadataUiChartDatum,
  key: string,
): MetadataUiChartValue | undefined {
  return (datum as Readonly<Record<string, MetadataUiChartValue>>)[key];
}

function MetadataUiHeatmapBody({ chart }: MetadataUiChartBodyProps) {
  const heatmap = chart.heatmap;

  if (!heatmap) {
    return null;
  }

  return (
    <div
      className="grid gap-surface-xs"
      style={{ minHeight: chart.display.height }}
      data-metadata-ui-chart-heatmap="true"
      role="img"
      aria-label={chart.title ?? chart.display.tableFallbackLabel}
    >
      {chart.data.map((datum, index) => {
        const xValue = readMetadataUiChartDatumValue(datum, heatmap.xKey);
        const yValue = readMetadataUiChartDatumValue(datum, heatmap.yKey);
        const value = readMetadataUiChartDatumValue(datum, heatmap.valueKey);
        const numericValue = typeof value === "number" ? value : 0;
        const opacity = Math.max(0.16, Math.min(1, numericValue / 100));

        return (
          <div
            key={`${String(xValue)}-${String(yValue)}-${index}`}
            className="rounded border px-3 py-2 text-sm"
            style={{
              backgroundColor: `color-mix(in srgb, var(--chart-1) ${Math.round(opacity * 100)}%, transparent)`,
            }}
            data-metadata-ui-heatmap-x={String(xValue ?? "")}
            data-metadata-ui-heatmap-y={String(yValue ?? "")}
          >
            <span>{String(xValue ?? "")}</span>
            <span className="mx-2 text-muted-foreground">
              {String(yValue ?? "")}
            </span>
            {heatmap.showValues ? <strong>{String(value ?? "")}</strong> : null}
          </div>
        );
      })}
    </div>
  );
}

function MetadataUiChartMetadataSummary({ chart }: MetadataUiChartBodyProps) {
  if (chart.annotations.length === 0 && chart.referenceBands.length === 0) {
    return null;
  }

  return (
    <div className="mt-surface-sm grid gap-surface-xs text-sm text-muted-foreground">
      {chart.annotations.length > 0 ? (
        <ul data-metadata-ui-chart-annotations="true">
          {chart.annotations.map((annotation) => (
            <li key={annotation.key}>{annotation.label}</li>
          ))}
        </ul>
      ) : null}
      {chart.referenceBands.length > 0 ? (
        <ul data-metadata-ui-chart-reference-bands="true">
          {chart.referenceBands.map((band) => (
            <li key={band.key}>
              {band.label}: {String(band.from)}-{String(band.to)}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
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
  const isHeatmap = chart.kind === "heatmap";

  return (
    <div
      className={cn("metadata-ui-chart-body", "min-w-0")}
      data-metadata-ui-chart-kind={chart.kind}
      data-metadata-ui-reduced-motion={chart.display.reducedMotion}
    >
      {isHeatmap ? (
        <MetadataUiHeatmapBody chart={chart} />
      ) : (
        <Suspense
          fallback={
            <div
              style={{ minHeight: chart.display.height }}
              data-metadata-ui-chart-loading="true"
            />
          }
        >
          <MetadataUiRechartsBody chart={chart} />
        </Suspense>
      )}
      <MetadataUiChartMetadataSummary chart={chart} />
      <MetadataUiChartTableFallback chart={chart} />
    </div>
  );
}
