import { getAppShellSkeletonNavItemIds } from "@afenda/kernel";
import { Skeleton } from "@afenda/ui/skeleton";
import { ui } from "@afenda/ui/design-system";
import { cn } from "@afenda/ui/utils";

export function WorkspaceSidebarSkeleton() {
  const navigationSkeletonItems = getAppShellSkeletonNavItemIds();

  return (
    <div
      className="flex h-full flex-col gap-surface-2xl"
      aria-busy="true"
      aria-label="Loading navigation"
    >
      <div
        className={cn(
          ui.radius.panel,
          "overflow-hidden border border-line bg-surface-strong p-surface-lg shadow-elevation-1",
        )}
      >
        <Skeleton className="h-1 w-full rounded-none" />
        <Skeleton className="mt-surface-lg h-4 w-24" />
        <div className="mt-surface-md flex gap-surface-md">
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="mt-2 h-3 w-28" />
          </div>
        </div>
        <Skeleton className="mt-surface-lg h-6 w-20 rounded-control" />
        <Skeleton className="mt-surface-md h-12 w-full" />
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <Skeleton className="mb-surface-md h-3 w-20" />
        <div className="flex flex-col gap-2">
          {navigationSkeletonItems.map((item) => (
            <Skeleton
              className="h-14 w-full rounded-section"
              key={item}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function WorkspaceHeaderSkeleton() {
  return (
    <div
      className="@container flex flex-col gap-surface-lg @lg:flex-row @lg:items-center @lg:justify-between"
      aria-busy="true"
      aria-label="Loading workspace header"
    >
      <div className="min-w-0 flex-1">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="mt-2 h-7 w-56 max-w-full" />
        <Skeleton className="mt-2 h-4 w-40" />
      </div>
      <Skeleton className="h-12 w-full max-w-xs rounded-panel @lg:w-72" />
    </div>
  );
}
