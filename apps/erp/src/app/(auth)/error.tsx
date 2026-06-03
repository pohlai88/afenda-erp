"use client";

import { routeErrorCopy } from "@afenda/kernel";
import { RouteStatePanel } from "@/app-route-state/route-states";

export default function AuthError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteStatePanel
      action={{ label: routeErrorCopy.authError.actionLabel, onClick: reset }}
      description={routeErrorCopy.authError.description}
      title={routeErrorCopy.authError.title}
    />
  );
}
