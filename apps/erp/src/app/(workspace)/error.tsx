"use client";

import { routeErrorCopy } from "@afenda/kernel";
import { RouteStatePanel } from "@/app-route-state/route-states";

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteStatePanel
      action={{ label: routeErrorCopy.appError.actionLabel, onClick: reset }}
      description={routeErrorCopy.appError.description}
      title={routeErrorCopy.appError.title}
    />
  );
}
