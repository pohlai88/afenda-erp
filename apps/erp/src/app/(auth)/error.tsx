"use client";

import { routeErrorCopy } from "@afenda/kernel";

export default function AuthError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const copy = routeErrorCopy.authError;

  return (
    <main className="neon-auth-ui-page surface-page flex w-full items-center justify-center p-surface-lg">
      <div className="max-w-md space-y-3 text-center">
        <h1 className="type-card-title">{copy.title}</h1>
        <p className="type-muted">{copy.description}</p>
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
