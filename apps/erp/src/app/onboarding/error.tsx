"use client";

import { routeErrorCopy } from "@afenda/kernel";

export default function OnboardingError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const copy = routeErrorCopy.onboardingError;

  return (
    <main className="neon-auth-ui-page flex min-h-[50vh] w-full items-center justify-center p-6">
      <div className="max-w-md space-y-3 text-center">
        <h1 className="text-lg font-semibold">{copy.title}</h1>
        <p className="text-sm text-muted-foreground">{copy.description}</p>
        <button
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          onClick={reset}
          type="button"
        >
          {copy.actionLabel}
        </button>
      </div>
    </main>
  );
}
