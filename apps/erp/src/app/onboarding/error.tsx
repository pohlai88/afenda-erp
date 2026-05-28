"use client";

import { routeErrorCopy } from "@afenda/kernel";
import { RouteStatePanel } from "@/app-route-state/route-states";
import { useEffect } from "react";

export default function OnboardingError({
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
      action={{
        label: routeErrorCopy.onboardingError.actionLabel,
        onClick: reset,
      }}
      description={routeErrorCopy.onboardingError.description}
      title={routeErrorCopy.onboardingError.title}
    />
  );
}
