import "server-only";

import {
  type MetadataUiChart,
  type MetadataUiChartInput,
  parseMetadataUiChart,
} from "../../schemas/chart.schema";
import { MetadataUiEmptyState } from "../../shell/empty-state.server";
import { ui } from "@afenda/ui/design-system";
import { cn } from "@afenda/ui/utils";
import { MetadataUiChartBody } from "./chart-body.client";

export type MetadataUiChartRendererProps = Readonly<{
  metadata: MetadataUiChartInput;
}>;

function renderMetadataUiChartServerSummary(chart: MetadataUiChart) {
  return (
    <div className={cn("flex flex-wrap", ui.surfaceGap.xs)} aria-hidden="true">
      {chart.series.map((series) => (
        <span
          key={series.key}
          className={cn(ui.radius.control, ui.surface.inset, ui.typography.caption)}
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
      className={cn("metadata-ui-chart", ui.surfaceGap.sm)}
      aria-label={chart.title ?? chart.key}
      data-metadata-ui-chart={chart.key}
      data-metadata-ui-chart-kind={chart.kind}
      data-metadata-ui-chart-rows={chart.data.length}
      data-metadata-ui-chart-series={chart.series.length}
    >
      {renderMetadataUiChartServerSummary(chart)}
      <div className={cn("min-w-0", ui.surface.inset, ui.padding.card)}>
        <MetadataUiChartBody chart={chart} />
      </div>
    </div>
  );
}

export default MetadataUiChartRenderer;
