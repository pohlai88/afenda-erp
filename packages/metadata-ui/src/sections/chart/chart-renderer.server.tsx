import "server-only";

import {
  type MetadataUiChartInput,
  parseMetadataUiChart,
} from "../../schemas/chart.schema";
import { MetadataUiPrimitiveBadge } from "../../primitives/badge.server";
import { MetadataUiEmptyState } from "../../shell/empty-state.server";
import { MetadataUiPrimitiveChartShell } from "../../primitives/chart-shell.server";
import { MetadataUiChartBody } from "./chart-body.client";

export type MetadataUiChartRendererProps = Readonly<{
  metadata: MetadataUiChartInput;
}>;

export function MetadataUiChartRenderer({ metadata }: MetadataUiChartRendererProps) {
  const chart = parseMetadataUiChart(metadata);

  if (chart.data.length === 0) {
    return (
      <MetadataUiEmptyState
        title="No chart data"
        description="No data points are available for this chart."
      />
    );
  }

  return (
    <MetadataUiPrimitiveChartShell
      chart={chart}
      className="metadata-ui-chart"
      summary={
        <div className="flex flex-wrap gap-surface-xs" aria-hidden="true">
          {chart.series.map((series) => (
            <MetadataUiPrimitiveBadge key={series.key} tone={series.tone}>
              {series.label}
            </MetadataUiPrimitiveBadge>
          ))}
        </div>
      }
      data-metadata-ui-chart={chart.key}
      data-metadata-ui-chart-kind={chart.kind}
      data-metadata-ui-chart-rows={chart.data.length}
      data-metadata-ui-chart-series={chart.series.length}
      aria-label={chart.title ?? chart.key}
    >
      <MetadataUiChartBody chart={chart} />
    </MetadataUiPrimitiveChartShell>
  );
}

export default MetadataUiChartRenderer;
