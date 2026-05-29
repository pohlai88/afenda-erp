import {
  GOVERNED_STAT_GRID_CLASS,
  GOVERNED_STAT_TILE_SKELETON_CLASS,
} from "@afenda/governed-surface";
import { Skeleton } from "@afenda/ui/skeleton";
import { ui } from "@afenda/ui/design-system";
import { cn } from "@afenda/ui/utils";

function GovernedStatGridSkeleton({ statCount }: { statCount: number }) {
  return (
    <div className={cn("@container", GOVERNED_STAT_GRID_CLASS.compact)}>
      {Array.from({ length: statCount }, (_, index) => (
        <Skeleton
          className={GOVERNED_STAT_TILE_SKELETON_CLASS}
          key={`stat-skeleton-${index}`}
        />
      ))}
    </div>
  );
}

export function GovernedStatSectionSkeleton({
  statCount = 3,
  layout = "card",
}: {
  statCount?: number;
  layout?: "card" | "embedded";
}) {
  const grid = <GovernedStatGridSkeleton statCount={statCount} />;

  if (layout === "embedded") {
    return (
      <div aria-busy="true" aria-label="Loading metrics">
        {grid}
      </div>
    );
  }

  return (
    <div
      className={cn(
        ui.radius.panel,
        "border border-line bg-card p-surface-lg",
      )}
      aria-busy="true"
      aria-label="Loading metrics"
    >
      <Skeleton className="h-5 w-40" />
      <div className="mt-surface-lg">{grid}</div>
    </div>
  );
}

export function WorkspaceEntityDetailSkeleton() {
  return (
    <div className="flex flex-col gap-surface-2xl" aria-busy="true">
      <div
        className={cn(
          ui.radius.panel,
          "border border-line bg-card p-surface-lg",
        )}
      >
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-surface-md h-8 w-64" />
        <Skeleton className="mt-surface-sm h-5 w-96 max-w-full" />
      </div>
      <GovernedListSectionSkeleton rows={4} tall />
    </div>
  );
}

export function GovernedListSectionSkeleton({
  rows = 6,
  tall = false,
  layout = "card",
}: {
  rows?: number;
  tall?: boolean;
  layout?: "card" | "embedded";
}) {
  const rowsBody = (
    <div className="flex flex-col gap-2">
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton
          className="h-11 w-full rounded-control"
          key={`list-row-skeleton-${index}`}
        />
      ))}
    </div>
  );

  if (layout === "embedded") {
    return (
      <div aria-busy="true" aria-label="Loading list">
        {rowsBody}
      </div>
    );
  }

  return (
    <div
      className={cn(
        ui.radius.panel,
        "border border-line bg-card p-surface-lg",
        tall ? "min-h-80" : undefined,
      )}
      aria-busy="true"
      aria-label="Loading list"
    >
      <Skeleton className="h-5 w-48" />
      <Skeleton className="mt-2 h-4 w-full max-w-xl" />
      <div className="mt-surface-lg">{rowsBody}</div>
    </div>
  );
}

/** Mirrors chart renderer min height (`chart.renderer.tsx` DATA_NATURE_CLASS). */
export function GovernedChartSectionSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading chart">
      <Skeleton className="min-h-[14rem] w-full rounded-control" /> {/* audit-ds: ignore no-arbitrary-value — chart skeleton minimum height contract */}
    </div>
  );
}

/** Mirrors `DashboardHardeningSection` SectionPanel + chart/list grid. */
export function DashboardHardeningSectionSkeleton() {
  return (
    <section
      className="border-t border-border pt-surface-2xl"
      aria-busy="true"
      aria-label="Loading production hardening"
    >
      <div className="flex flex-col gap-surface-lg">
        <div className="max-w-3xl">
          <Skeleton className="h-8 w-2/5 max-w-sm" />
          <Skeleton className="mt-surface-md h-4 w-full max-w-2xl" />
        </div>
        <div className="@container grid gap-surface-2xl @xl:grid-cols-[minmax(360px,0.6fr)_minmax(0,1.4fr)]">
          <GovernedChartSectionSkeleton />
          <GovernedListSectionSkeleton rows={6} layout="embedded" />
        </div>
      </div>
    </section>
  );
}

/** Mirrors `SectionPanel` + embedded stat grid on dashboard/module headers. */
export function ModuleScreenHeaderSkeleton({
  statCount = 3,
}: {
  statCount?: number;
}) {
  return (
    <section
      className="border-t border-border pt-surface-2xl"
      aria-busy="true"
      aria-label="Loading module header"
    >
      <div className="@container flex flex-col gap-surface-lg">
        <div className="flex flex-col gap-surface-lg @lg:flex-row @lg:items-start @lg:justify-between">
          <div className="max-w-3xl">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-surface-lg h-8 w-2/5 max-w-sm" />
            <Skeleton className="mt-surface-md h-4 w-full max-w-2xl" />
          </div>
          <Skeleton className="h-16 w-32 shrink-0 rounded-section" />
        </div>
        <GovernedStatGridSkeleton statCount={statCount} />
      </div>
    </section>
  );
}

export function TwoColumnWorkspaceSkeleton() {
  return (
    <div
      className="@container grid gap-surface-2xl @xl:grid-cols-2"
      aria-busy="true"
      aria-label="Loading workspace columns"
    >
      <GovernedListSectionSkeleton />
      <GovernedListSectionSkeleton />
    </div>
  );
}

export function DashboardPriorityColumnSkeleton() {
  return (
    <div
      className="@container grid gap-surface-2xl @xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]"
      aria-busy="true"
      aria-label="Loading dashboard queues"
    >
      <GovernedListSectionSkeleton rows={5} />
      <div className={cn(ui.radius.panel, "border border-line bg-card p-surface-lg")}>
        <Skeleton className="h-5 w-44" />
        <div className="mt-surface-lg">
          <GovernedStatSectionSkeleton statCount={3} layout="embedded" />
        </div>
        <Skeleton className="mt-surface-md h-32 w-full rounded-section" />
      </div>
    </div>
  );
}

export function LynxConsoleHeroSkeleton() {
  return (
    <div
      className={cn(
        ui.radius.panel,
        "border border-line bg-card p-surface-2xl",
      )}
      aria-busy="true"
      aria-label="Loading Lynx console"
    >
      <Skeleton className="h-3 w-28" />
      <Skeleton className="mt-surface-lg h-8 w-64 max-w-full" />
      <Skeleton className="mt-surface-md h-4 w-full max-w-2xl" />
      <div className="mt-surface-2xl">
        <GovernedStatSectionSkeleton statCount={4} layout="embedded" />
      </div>
    </div>
  );
}
