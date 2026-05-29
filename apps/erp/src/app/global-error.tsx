"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      {/* audit-ds: ignore no-arbitrary-value — global-error renders outside app theme shell */}
      <body className="min-h-full bg-[#f6f7f9] font-sans text-[#131922] antialiased">
        <main className="flex min-h-screen items-center justify-center px-surface-2xl py-16">
          <div className="w-full max-w-lg rounded-panel border border-black/10 bg-white p-8 shadow-elevation-1">
            <div className="type-caption uppercase tracking-wide text-slate-500">
              Afenda ERP
            </div>
            <h1 className="mt-3 type-section-title font-semibold">Application error</h1>
            <p className="mt-3 type-body leading-6 text-slate-600">
              A critical error prevented the app shell from rendering.
              {error.digest ? ` Reference: ${error.digest}.` : null}
            </p>
            <button
              className="mt-surface-2xl inline-flex rounded-section border border-black/10 bg-slate-50 px-surface-lg py-2 type-body font-medium transition hover:bg-slate-100"
              onClick={reset}
              type="button"
            >
              Reload application
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
