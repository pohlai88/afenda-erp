import "server-only";

import { ui } from "@afenda/ui/design-system";
import { cn } from "@afenda/ui/utils";

import { MetadataUiPrimitiveBadge } from "../../primitives/badge.server";
import { MetadataUiPrimitiveStatValue } from "../../primitives/stat-value.client";
import {
  type MetadataUiStatInput,
  type MetadataUiStatItem,
  parseMetadataUiStat,
} from "../../schemas/stat.schema";

export type MetadataUiStatRendererProps = Readonly<{
  metadata: MetadataUiStatInput;
}>;

const STAT_LAYOUT_CLASS = {
  grid: "grid md:grid-cols-2 xl:grid-cols-4",
  row: "grid md:grid-cols-2",
  column: "grid",
} as const;

function renderMetadataUiStatProgress(item: MetadataUiStatItem) {
  if (!item.display.progress) {
    return null;
  }

  const percent = Math.round(
    (item.display.progress.value / item.display.progress.max) * 100,
  );

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-3 text-xs text-zinc-500">
        <span>{item.display.progress.label ?? "Progress"}</span>
        <span>{percent}%</span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-zinc-100"
        role="progressbar"
        aria-label={item.display.progress.label ?? `${item.label} progress`}
        aria-valuemin={0}
        aria-valuemax={item.display.progress.max}
        aria-valuenow={item.display.progress.value}
      >
        <div
          className="h-full rounded-full bg-zinc-900"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function renderMetadataUiStatSparkline(item: MetadataUiStatItem) {
  if (item.display.sparkline.length === 0) {
    return null;
  }

  const values = item.display.sparkline.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return (
    <div
      className="flex h-8 items-end gap-1"
      aria-label={`${item.label} sparkline`}
      role="img"
    >
      {item.display.sparkline.map((point, index) => {
        const height = 20 + ((point.value - min) / range) * 80;

        return (
          <span
            key={`${point.value}-${index}`}
            className="w-1 rounded-t bg-zinc-300"
            style={{ height: `${height}%` }}
            title={point.label ?? String(point.value)}
          />
        );
      })}
    </div>
  );
}

export function MetadataUiStatRenderer({ metadata }: MetadataUiStatRendererProps) {
  const stat = parseMetadataUiStat(metadata);

  return (
    <div
      className={cn("metadata-ui-stat", STAT_LAYOUT_CLASS[stat.layout], ui.surfaceGap.md)}
      data-metadata-ui-stat={stat.key}
      data-metadata-ui-stat-layout={stat.layout}
    >
      {stat.items.map((item) => (
        <article
          key={item.key}
          className={cn(
            "min-w-0",
            ui.surface.inset,
            ui.radius.section,
            ui.padding.card,
            ui.surfaceGap.sm,
          )}
        >
          <div className="flex min-w-0 items-start justify-between gap-3">
            <div className="min-w-0">
              <div className={ui.typography.label}>{item.label}</div>
              {item.display.iconKey ? (
                <div className={ui.typography.caption}>
                  {item.display.iconKey}
                </div>
              ) : null}
            </div>
            {item.tone !== "neutral" ? (
              <MetadataUiPrimitiveBadge tone={item.tone}>
                {item.tone}
              </MetadataUiPrimitiveBadge>
            ) : null}
          </div>
          <div className={cn("flex flex-wrap items-baseline gap-1", ui.typography.sectionTitle)}>
            <MetadataUiPrimitiveStatValue
              value={item.value}
              format={item.format}
              display={item.display}
              unit={item.unit}
            />
          </div>
          {item.description ? (
            <p className={ui.typography.muted}>{item.description}</p>
          ) : null}
          {item.comparison ? (
            <p className={ui.typography.caption}>
              {item.comparison.label}: {item.comparison.value}
            </p>
          ) : null}
          {renderMetadataUiStatProgress(item)}
          {renderMetadataUiStatSparkline(item)}
        </article>
      ))}
    </div>
  );
}

export default MetadataUiStatRenderer;
