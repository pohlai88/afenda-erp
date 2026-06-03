"use client";

import {
  RouteStatePanel,
  RouteStateShell,
} from "@/routes/route-state";
import { RouteStateRetryButton } from "@/routes/route-state.client";

export default function LynxError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteStateShell layout="workspace">
      <RouteStatePanel
        action={<RouteStateRetryButton onClick={reset}>Retry</RouteStateRetryButton>}
        align="start"
        description={
          error.message ||
          "The tenant-scoped Lynx model could not be resolved."
        }
        kind="error"
        label="Lynx"
        title="Lynx workspace failed to load"
      />
    </RouteStateShell>
  );
}
