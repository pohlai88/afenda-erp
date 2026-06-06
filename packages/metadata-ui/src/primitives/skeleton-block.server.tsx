import "server-only";

import type { ReactNode } from "react";
import { Skeleton } from "@afenda/ui";
import { ui } from "@afenda/ui/design-system";
import { cn } from "@afenda/ui/utils";

export type MetadataUiPrimitiveSkeletonBlockVariant =
  | "card"
  | "page-header"
  | "table"
  | "form"
  | "metric"
  | "timeline";

export type MetadataUiPrimitiveSkeletonBlockProps = Readonly<{
  variant: MetadataUiPrimitiveSkeletonBlockVariant;
  className?: string;
  title?: ReactNode;
  description?: ReactNode;
}>;

function renderMetadataUiSkeletonCard() {
  return (
    <div className="grid gap-surface-sm">
      <Skeleton className="h-6 w-2/5" />
      <Skeleton className="h-4 w-3/5" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-24 w-full rounded-section" />
    </div>
  );
}

function renderMetadataUiSkeletonPageHeader() {
  return (
    <div className="grid gap-surface-sm">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-8 w-72" />
      <Skeleton className="h-4 w-96" />
      <div className="flex flex-wrap gap-surface-xs">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-28" />
      </div>
    </div>
  );
}

function renderMetadataUiSkeletonTable() {
  return (
    <div className="grid gap-surface-sm">
      <div className="flex flex-wrap gap-surface-xs">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-8 w-28" />
      </div>
      <div className="grid gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="grid grid-cols-4 gap-2">
            <Skeleton className="h-10 rounded-card" />
            <Skeleton className="h-10 rounded-card" />
            <Skeleton className="h-10 rounded-card" />
            <Skeleton className="h-10 rounded-card" />
          </div>
        ))}
      </div>
    </div>
  );
}

function renderMetadataUiSkeletonForm() {
  return (
    <div className="grid gap-surface-sm">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="grid gap-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-full rounded-card" />
        </div>
      ))}
    </div>
  );
}

function renderMetadataUiSkeletonMetric() {
  return (
    <div className="grid gap-surface-sm">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-32" />
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-2 w-full rounded-full" />
    </div>
  );
}

function renderMetadataUiSkeletonTimeline() {
  return (
    <div className="grid gap-surface-sm">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="grid gap-2 rounded-section border border-border/60 p-surface-sm">
          <div className="flex items-center justify-between gap-surface-xs">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  );
}

export function MetadataUiPrimitiveSkeletonBlock({
  variant,
  className,
  title,
  description,
}: MetadataUiPrimitiveSkeletonBlockProps) {
  const content = {
    card: renderMetadataUiSkeletonCard(),
    "page-header": renderMetadataUiSkeletonPageHeader(),
    table: renderMetadataUiSkeletonTable(),
    form: renderMetadataUiSkeletonForm(),
    metric: renderMetadataUiSkeletonMetric(),
    timeline: renderMetadataUiSkeletonTimeline(),
  }[variant];

  return (
    <section className={cn("metadata-ui-skeleton-block grid", ui.surfaceGap.sm, className)}>
      {(title || description) ? (
        <div className="grid gap-surface-2xs">
          {title ? <h2 className={cn(ui.typography.sectionTitle, ui.color.ink.foreground)}>{title}</h2> : null}
          {description ? <p className={cn(ui.typography.caption, ui.color.ink.muted)}>{description}</p> : null}
        </div>
      ) : null}
      {content}
    </section>
  );
}

