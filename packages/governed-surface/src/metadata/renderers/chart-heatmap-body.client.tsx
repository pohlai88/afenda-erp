"use client";

import { useMemo } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@afenda/ui/tooltip";
import type { GovernedChartConfiguration } from "../../schemas/chart.schema";
import { cn } from "@afenda/ui/utils";

type ChartHeatmapBodyProps = {
  configuration: GovernedChartConfiguration;
};

function heatColor(value: number, max: number): string {
  const t = max > 0 ? Math.min(1, value / max) : 0;
  const low = Math.round((1 - t) * 100);
  const high = Math.round(t * 100);
  return `color-mix(in oklch, var(--viz-heatmap-low) ${low}%, var(--viz-heatmap-high) ${high}%)`;
}

export function ChartHeatmapBody({ configuration }: ChartHeatmapBodyProps) {
  const cells = useMemo(
    () => configuration.heatmap?.cells ?? [],
    [configuration.heatmap?.cells],
  );
  const max = useMemo(
    () => Math.max(1, ...cells.map((cell) => cell.value)),
    [cells],
  );

  if (cells.length === 0) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        No heatmap data.
      </p>
    );
  }

  const title = configuration.title ?? "Heatmap";

  return (
    <div
      className="@container grid w-full gap-1.5 rounded-lg border border-border/50 bg-muted/20 p-3"
      style={{
        gridTemplateColumns: "repeat(auto-fill, minmax(2.75rem, 1fr))",
      }}
      role="grid"
      aria-label={title}
    >
      {cells.map((cell) => {
        const title = cell.label ?? `${cell.date}: ${cell.value}`;
        return (
          <Tooltip key={cell.date}>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "aspect-square min-h-9 rounded-md border border-border/50 shadow-sm transition-[transform,box-shadow]",
                  "hover:scale-105 hover:shadow-md",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  "motion-reduce:transition-none motion-reduce:hover:scale-100",
                )}
                style={{ backgroundColor: heatColor(cell.value, max) }}
                role="gridcell"
                tabIndex={0}
                aria-label={title}
              />
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              <p className="font-medium">{cell.date}</p>
              <p className="text-muted-foreground">
                {configuration.heatmap?.valueLabel ?? "Value"}: {cell.value}
              </p>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
