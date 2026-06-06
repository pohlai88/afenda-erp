import "server-only";

import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@afenda/ui";
import { ui } from "@afenda/ui/design-system";
import { cn } from "@afenda/ui/utils";

import { MetadataUiPrimitiveBadge } from "./badge.server";
import { MetadataUiPrimitiveStatValue } from "./stat-value.client";
import type { MetadataUiStatItem } from "../schemas/stat.schema";

export type MetadataUiPrimitiveMetricCardProps = Readonly<{
  item: MetadataUiStatItem;
  actions?: ReactNode;
  footer?: ReactNode;
  className?: string;
}>;

const METRIC_TREND_TONE = {
  up: "positive",
  down: "critical",
  flat: "neutral",
} as const;

export function MetadataUiPrimitiveMetricCard({
  item,
  actions,
  footer,
  className,
}: MetadataUiPrimitiveMetricCardProps) {
  const sparklineValues = item.display.sparkline.map((sparkPoint) => sparkPoint.value);
  const sparklineMin = sparklineValues.length > 0 ? Math.min(...sparklineValues) : 0;
  const sparklineMax = sparklineValues.length > 0 ? Math.max(...sparklineValues) : 1;
  const sparklineRange = sparklineMax - sparklineMin || 1;
  const progressPercent = item.display.progress
    ? Math.round((item.display.progress.value / item.display.progress.max) * 100)
    : 0;

  return (
    <Card
      className={cn("metadata-ui-metric-card", className)}
      role="group"
      aria-label={item.label}
      data-metadata-ui-metric-card={item.key}
      data-metadata-ui-metric-format={item.format}
      data-metadata-ui-metric-tone={item.tone}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-surface-sm">
          <div className="grid min-w-0 gap-surface-2xs">
            <CardTitle>{item.label}</CardTitle>
            {item.description ? <CardDescription>{item.description}</CardDescription> : null}
          </div>
          {item.tone !== "neutral" ? (
            <MetadataUiPrimitiveBadge tone={item.tone}>{item.tone}</MetadataUiPrimitiveBadge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="grid gap-surface-sm">
        <div className={cn("flex flex-wrap items-baseline gap-1", ui.typography.sectionTitle)}>
          <MetadataUiPrimitiveStatValue
            value={item.value}
            format={item.format}
            display={item.display}
            unit={item.unit}
          />
        </div>
        {item.comparison ? (
          <div className="flex flex-wrap items-center gap-surface-xs">
            <MetadataUiPrimitiveBadge tone={METRIC_TREND_TONE[item.comparison.direction]}>
              {item.comparison.label}
            </MetadataUiPrimitiveBadge>
            <span className={cn(ui.typography.caption, ui.color.ink.muted)}>
              {item.comparison.value}
            </span>
          </div>
        ) : null}
        {item.display.progress ? (
          <div className="grid gap-surface-2xs">
            <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>{item.display.progress.label ?? "Progress"}</span>
              <span>{progressPercent}%</span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-label={item.display.progress.label ?? `${item.label} progress`}
              aria-valuemin={0}
              aria-valuemax={item.display.progress.max}
              aria-valuenow={item.display.progress.value}
              data-metadata-ui-metric-progress={progressPercent}
            >
              <div
                className="h-full rounded-full bg-primary"
                style={{
                  width: `${progressPercent}%`,
                }}
              />
            </div>
          </div>
        ) : null}
        {item.display.sparkline.length > 0 ? (
          <div className="flex h-8 items-end gap-1" aria-label={`${item.label} sparkline`} role="img">
            {item.display.sparkline.map((point, index) => {
              const height = 20 + ((point.value - sparklineMin) / sparklineRange) * 80;

              return (
                <span
                  key={`${point.value}-${index}`}
                  className="w-1 rounded-t bg-muted-foreground/30"
                  style={{ height: `${height}%` }}
                  title={point.label ?? String(point.value)}
                />
              );
            })}
          </div>
        ) : null}
      </CardContent>
      {(actions || footer) ? (
        <CardFooter className="flex flex-wrap items-center justify-between gap-surface-xs">
          {actions ? <div className="flex flex-wrap items-center gap-surface-xs">{actions}</div> : null}
          {footer ? <div className="flex flex-wrap items-center gap-surface-xs">{footer}</div> : null}
        </CardFooter>
      ) : null}
    </Card>
  );
}
