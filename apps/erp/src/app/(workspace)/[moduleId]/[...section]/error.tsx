"use client";

import { routeErrorCopy } from "@afenda/kernel";
import { RouteStatePanel } from "@/app-route-state/route-states";

export default function SystemAdminSectionError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteStatePanel
      action={{
        label: routeErrorCopy.systemAdmin.actionLabel,
        onClick: reset,
      }}
      description={routeErrorCopy.systemAdmin.description}
      title={routeErrorCopy.systemAdmin.title}
    />
  );
}
