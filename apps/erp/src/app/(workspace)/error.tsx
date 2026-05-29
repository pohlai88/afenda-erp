"use client";

import { routeErrorCopy } from "@afenda/kernel";
import { RouteStatePanel } from "@/app-route-state/route-states";
import { useEffect } from "react";

export default function AppError({
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
      action={{ label: routeErrorCopy.appError.actionLabel, onClick: reset }}
      description={routeErrorCopy.appError.description}
      title={routeErrorCopy.appError.title}
    />
  );
}
