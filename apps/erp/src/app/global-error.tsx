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
      <body className="min-h-full bg-[#f6f7f9] font-sans text-[#131922] antialiased">
        <main className="flex min-h-screen items-center justify-center px-6 py-16">
          <div className="w-full max-w-lg rounded-2xl border border-black/10 bg-white p-8 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-slate-500">
              Afenda ERP
            </div>
            <h1 className="mt-3 text-2xl font-semibold">Application error</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              A critical error prevented the app shell from rendering.
              {error.digest ? ` Reference: ${error.digest}.` : null}
            </p>
            <button
              className="mt-6 inline-flex rounded-lg border border-black/10 bg-slate-50 px-4 py-2 text-sm font-medium transition hover:bg-slate-100"
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
