"use client";

import { routeErrorCopy } from "@afenda/kernel";

import {
  RouteStatePanel,
  RouteStateShell,
  formatRouteErrorDescription,
} from "@/routes/route-state";
import { RouteStateRetryButton } from "@/routes/route-state.client";

import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const copy = routeErrorCopy.rootError;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-full bg-background font-sans text-foreground antialiased">
        <RouteStateShell layout="centered">
          <RouteStatePanel
            action={
              <RouteStateRetryButton onClick={reset}>
                {copy.actionLabel}
              </RouteStateRetryButton>
            }
            description={formatRouteErrorDescription(
              copy.description,
              error.digest,
            )}
            kind="error"
            title={copy.title}
          />
        </RouteStateShell>
      </body>
    </html>
  );
}
