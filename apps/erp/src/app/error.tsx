"use client";

import { routeErrorCopy } from "@afenda/kernel";
import { RouteStatePanel } from "@/app-route-state/route-states";
import { useEffect } from "react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <RouteStatePanel
      action={{ label: routeErrorCopy.rootError.actionLabel, onClick: reset }}
      description={routeErrorCopy.rootError.description}
      title={routeErrorCopy.rootError.title}
    />
  );
}
