import "server-only";

import {
  type MetadataUiChart,
  type MetadataUiChartInput,
  parseMetadataUiChart,
} from "../../schemas/chart.schema";
import { MetadataUiEmptyState } from "../../shell/empty-state.server";
import { MetadataUiChartBody } from "./chart-body.client";

export type MetadataUiChartRendererProps = Readonly<{
  metadata: MetadataUiChartInput;
}>;

function renderMetadataUiChartServerSummary(chart: MetadataUiChart) {
  return (
    <div className="flex flex-wrap gap-2" aria-hidden="true">
      {chart.series.map((series) => (
        <span
          key={series.key}
          className="rounded border border-zinc-200 px-2 py-1 text-xs text-zinc-600"
        >
          {series.label}
        </span>
      ))}
    </div>
  );
}

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
    <div
      className="metadata-ui-chart space-y-3"
      aria-label={chart.title ?? chart.key}
      data-metadata-ui-chart={chart.key}
      data-metadata-ui-chart-kind={chart.kind}
      data-metadata-ui-chart-rows={chart.data.length}
      data-metadata-ui-chart-series={chart.series.length}
    >
      {renderMetadataUiChartServerSummary(chart)}
      <div className="min-w-0 rounded-md border border-zinc-200 p-3">
        <MetadataUiChartBody chart={chart} />
      </div>
    </div>
  );
}

export default MetadataUiChartRenderer;
