"use client";

import { routeErrorCopy } from "@afenda/kernel";

import {
  RouteStatePanel,
  RouteStateShell,
} from "@/routes/route-state";
import { RouteStateRetryButton } from "@/routes/route-state.client";

export default function AuthError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const copy = routeErrorCopy.authError;

  return (
    <RouteStateShell layout="centered-auth">
      <RouteStatePanel
        action={
          <RouteStateRetryButton onClick={reset}>
            {copy.actionLabel}
          </RouteStateRetryButton>
        }
        description={copy.description}
        kind="error"
        title={copy.title}
      />
    </RouteStateShell>
  );
}
