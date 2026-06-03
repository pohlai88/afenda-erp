"use client";

import { routeErrorCopy } from "@afenda/kernel";

export default function RootError({
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
    <main className="surface-page flex w-full items-center justify-center p-surface-lg">
      <div className="max-w-md space-y-3 text-center">
        <h1 className="type-card-title">{copy.title}</h1>
        <p className="type-muted">{description}</p>
        <button
          className="type-control text-primary underline-offset-4 hover:underline"
          onClick={reset}
          type="button"
        >
          {copy.actionLabel}
        </button>
      </div>
    </main>
  );
}
