import { Skeleton } from "@afenda/ui/skeleton";
import { ui } from "@afenda/ui/design-system";
import { cn } from "@afenda/ui/utils";

/** Main-column fallback while a `(workspace)` page suspends — shell layout stays mounted. */
export function WorkspacePageSkeleton() {
  return (
    <div
      className="flex flex-col gap-surface-2xl"
      aria-busy="true"
      aria-label="Loading workspace page"
    >
      <div
        className={cn(
          ui.radius.panel,
          "border border-line bg-card p-surface-2xl",
        )}
      >
        <Skeleton className="h-3 w-28" />
        <Skeleton className="mt-surface-lg h-8 w-2/3 max-w-md" />
        <Skeleton className="mt-surface-md h-4 w-full max-w-xl" />
        <div className="mt-surface-2xl @container grid gap-surface-lg @md:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton
              className="h-24 w-full rounded-section"
              key={`workspace-page-stat-${index}`}
            />
          ))}
        </div>
      </div>
      <Skeleton className="h-72 w-full rounded-panel" />
      <Skeleton className="h-56 w-full rounded-panel" />
    </div>
  );
}
