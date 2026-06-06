import "server-only";

import type { ComponentProps, ReactNode } from "react";
import { ui } from "@afenda/ui/design-system";
import { cn } from "@afenda/ui/utils";

import { MetadataUiPrimitiveBadge } from "./badge.server";
import { MetadataUiPrimitiveCard } from "./card.server";
import type { MetadataUiChart } from "../schemas/chart.schema";

export type MetadataUiPrimitiveChartShellProps = Readonly<{
  chart: MetadataUiChart;
  summary?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}> &
  Omit<ComponentProps<"section">, "children" | "className">;

export function MetadataUiPrimitiveChartShell({
  chart,
  summary,
  children,
  className,
  contentClassName,
  ...domAttributes
}: MetadataUiPrimitiveChartShellProps) {
  return (
    <section {...domAttributes} className={cn("metadata-ui-chart-shell", className)}>
      <MetadataUiPrimitiveCard
        eyebrow={chart.kind}
        title={chart.title}
        description={chart.description}
        meta={
          <div className="flex flex-wrap items-center gap-surface-xs">
            <MetadataUiPrimitiveBadge tone={chart.series[0]?.tone ?? "neutral"}>
              {chart.series.length} series
            </MetadataUiPrimitiveBadge>
            <span className={cn(ui.typography.caption, ui.color.ink.muted)}>
              {chart.data.length} rows
            </span>
          </div>
        }
        contentClassName={contentClassName}
      >
        <div className="grid gap-surface-sm">
          {summary}
          {children}
        </div>
      </MetadataUiPrimitiveCard>
    </section>
  );
}
