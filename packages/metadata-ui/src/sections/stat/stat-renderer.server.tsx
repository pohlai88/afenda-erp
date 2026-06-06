import "server-only";

import { ui } from "@afenda/ui/design-system";
import { cn } from "@afenda/ui/utils";

import { MetadataUiPrimitiveMetricCard } from "../../primitives/metric-card.server";
import {
  type MetadataUiStatInput,
  parseMetadataUiStat,
} from "../../schemas/stat.schema";

export type MetadataUiStatRendererProps = Readonly<{
  metadata: MetadataUiStatInput;
}>;

export function MetadataUiStatRenderer({ metadata }: MetadataUiStatRendererProps) {
  const stat = parseMetadataUiStat(metadata);

  return (
    <div
      className={cn(
        "metadata-ui-stat grid",
        stat.layout === "grid"
          ? "md:grid-cols-2 xl:grid-cols-4"
          : stat.layout === "row"
            ? "md:grid-cols-2"
            : "grid",
        ui.surfaceGap.md,
      )}
      data-metadata-ui-stat={stat.key}
      data-metadata-ui-stat-layout={stat.layout}
    >
      {stat.items.map((item) => (
        <MetadataUiPrimitiveMetricCard key={item.key} item={item} />
      ))}
    </div>
  );
}

export default MetadataUiStatRenderer;
