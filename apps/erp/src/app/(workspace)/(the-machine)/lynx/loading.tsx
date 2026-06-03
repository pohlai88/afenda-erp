import { Skeleton } from "@afenda/ui";

import { RouteStateShell } from "@/routes/route-state";

export default function LynxLoading() {
  return (
    <RouteStateShell ariaBusy layout="workspace">
      <Skeleton className="h-24 rounded-section" />
      <div className="grid gap-surface-md">
        <Skeleton className="h-28 rounded-section" />
        <Skeleton className="h-28 rounded-section" />
        <Skeleton className="h-28 rounded-section" />
      </div>
      <Skeleton className="h-80 rounded-section" />
    </RouteStateShell>
  );
}
