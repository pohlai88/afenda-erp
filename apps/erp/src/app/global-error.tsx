"use client";

import { routeErrorCopy } from "@afenda/kernel";

import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const copy = routeErrorCopy.rootError;
  const description = error.digest
    ? `${copy.description} Reference: ${error.digest}.`
    : copy.description;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-full bg-background font-sans text-foreground antialiased">
        <main className="flex min-h-full items-center justify-center p-6">
          <div className="max-w-md space-y-3 text-center">
            <h1 className="text-lg font-semibold">{copy.title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
            <button
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              onClick={reset}
              type="button"
            >
              {copy.actionLabel}
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
