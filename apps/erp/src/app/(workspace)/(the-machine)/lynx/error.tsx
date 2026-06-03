"use client";

export default function LynxError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="surface-page text-foreground">
      <section className="page-shell section-stack">
        <div className="surface-section p-surface-lg">
          <p className="type-section-label">Lynx</p>
          <h1 className="type-section-title">Lynx workspace failed to load</h1>
          <p className="type-muted">
            {error.message ||
              "The tenant-scoped Lynx model could not be resolved."}
          </p>
          <button
            className="mt-surface-md inline-flex h-9 w-fit items-center rounded-control border border-border px-surface-sm type-control outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={reset}
            type="button"
          >
            Retry
          </button>
        </div>
      </section>
    </main>
  );
}
