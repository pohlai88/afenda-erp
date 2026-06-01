import { Skeleton } from "@afenda/ui";

export function AppShellSubLayoutShellSkeleton() {
  return (
    <div className="flex min-h-[18rem] gap-6">
      <div className="hidden w-44 shrink-0 md:block">
        <Skeleton className="h-full w-full rounded-card" />
      </div>
      <div className="flex-1">
        <Skeleton className="mb-6 h-10 w-full rounded-card" />
        <Skeleton className="h-40 w-full rounded-card" />
      </div>
    </div>
  );
}
