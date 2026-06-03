import { Skeleton } from "@afenda/ui/skeleton";

import type { AfendaGovernedRendererId } from "./gov-registry";

export type GovernedComponentSkeletonProps = {
  rendererId: AfendaGovernedRendererId;
};

function assertNever(value: never): never {
  throw new Error(`Unhandled governed renderer skeleton: ${value}`);
}

export function GovernedComponentSkeleton({
  rendererId,
}: GovernedComponentSkeletonProps) {
  switch (rendererId) {
    case "stat-card":
      return (
        <section
          className="@container"
          aria-hidden="true"
          data-testid="governed-skeleton-stat-card"
        >
          <div className="grid grid-cols-1 gap-3 @sm:grid-cols-2 @2xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-24 rounded-card" />
            ))}
          </div>
        </section>
      );

    case "list-surface":
      return (
        <div
          className="@container flex flex-col gap-3"
          aria-hidden="true"
          data-testid="governed-skeleton-list-surface"
        >
          <div className="flex justify-end gap-2">
            <Skeleton className="h-8 w-20 rounded-control" />
            <Skeleton className="h-8 w-24 rounded-control" />
          </div>
          <Skeleton className="h-9 w-full rounded-control" />
          <div className="flex flex-col gap-1.5">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full rounded-control" />
            ))}
          </div>
        </div>
      );

    case "section":
      return (
        <div
          className="flex flex-col gap-surface-lg"
          aria-hidden="true"
          data-testid="governed-skeleton-section"
        >
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3 w-72 max-w-full" />
          </div>
          <div className="flex flex-col gap-3">
            <Skeleton className="h-24 w-full rounded-card" />
            <Skeleton className="h-32 w-full rounded-card" />
          </div>
        </div>
      );

    case "stack":
      return (
        <div
          className="grid grid-cols-1 gap-3 @sm:grid-cols-2"
          aria-hidden="true"
          data-testid="governed-skeleton-stack"
        >
          <Skeleton className="h-28 min-w-0 rounded-card" />
          <Skeleton className="h-28 min-w-0 rounded-card" />
        </div>
      );

    case "action-bar":
      return (
        <div
          className="flex flex-wrap gap-2"
          aria-hidden="true"
          data-testid="governed-skeleton-action-bar"
        >
          <Skeleton className="h-9 w-24 rounded-control" />
          <Skeleton className="h-9 w-28 rounded-control" />
          <Skeleton className="h-9 w-20 rounded-control" />
        </div>
      );

    case "audit-panel":
    case "detail-tabs":
      return (
        <div
          className="flex flex-col gap-3"
          aria-hidden="true"
          data-testid={`governed-skeleton-${rendererId}`}
        >
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-56 w-full rounded-card" />
        </div>
      );

    case "approval-timeline":
      return (
        <div
          className="flex flex-col gap-3"
          aria-hidden="true"
          data-testid="governed-skeleton-approval-timeline"
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full rounded-section" />
          ))}
        </div>
      );

    case "chart":
      return (
        <div
          className="@container flex flex-col gap-3"
          aria-hidden="true"
          data-testid="governed-skeleton-chart"
        >
          <Skeleton className="h-6 w-48" />
          <div className="grid grid-cols-7 gap-1.5 rounded-section border border-border/40 p-3">
            {Array.from({ length: 14 }).map((_, index) => (
              <Skeleton
                key={index}
                className="aspect-square min-h-8 rounded-control"
              />
            ))}
          </div>
        </div>
      );

    case "kanban-board":
      return (
        <section
          className="@container"
          aria-hidden="true"
          data-testid="governed-skeleton-kanban-board"
        >
          <div className="grid grid-cols-1 gap-3 @sm:grid-cols-2 @3xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-48 rounded-card" />
            ))}
          </div>
        </section>
      );

    case "multi-step-form":
    case "scorecard-form":
      return (
        <div
          className="flex flex-col gap-3"
          aria-hidden="true"
          data-testid={`governed-skeleton-${rendererId}`}
        >
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-48 w-full rounded-card" />
        </div>
      );

    case "empty":
      return (
        <Skeleton
          className="h-16 w-full rounded-card"
          aria-hidden="true"
          data-testid="governed-skeleton-empty"
        />
      );
  }

  return assertNever(rendererId);
}
