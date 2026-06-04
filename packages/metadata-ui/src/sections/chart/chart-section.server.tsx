import "server-only";

import type { ReactNode } from "react";

import { type MetadataUiChartInput, parseMetadataUiChart } from "../../schemas/chart.schema";
import { MetadataUiSectionShell } from "../../shell/section-shell.server";
import { MetadataUiChartRenderer } from "./chart-renderer.server";

export type MetadataUiChartSectionProps = Readonly<{
  metadata: MetadataUiChartInput;
  children?: ReactNode;
}>;

export function MetadataUiChartSection({
  metadata,
  children,
}: MetadataUiChartSectionProps) {
  const chart = parseMetadataUiChart(metadata);

  return (
    <MetadataUiSectionShell
      id={chart.key}
      sectionKind="chart"
      title={chart.title}
      description={chart.description}
      presentation={chart.presentation}
      diagnostics={chart.diagnostics}
    >
      {children ?? <MetadataUiChartRenderer metadata={chart} />}
    </MetadataUiSectionShell>
  );
}

export default MetadataUiChartSection;
