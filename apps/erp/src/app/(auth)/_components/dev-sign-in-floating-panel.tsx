import { isDevCookieAuthEnabled } from "@afenda/config/env";
import { DevSignInForm } from "./dev-sign-in-form";

export function DevSignInFloatingPanel() {
  if (!isDevCookieAuthEnabled()) {
    return null;
  }

  return (
    <aside
      aria-label="Developer sign-in"
      className="@container fixed right-4 bottom-4 z-overlay w-[calc(100vw-2rem)] max-w-sm @sm:right-6 @sm:bottom-6" // audit-ds: ignore no-arbitrary-value — mobile viewport inset for floating dev panel
    >
      <details className="group rounded-section border border-line bg-card shadow-elevation-3">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-surface-lg py-3 type-body font-medium text-foreground outline-none transition hover:bg-surface-strong focus-visible:ring-2 focus-visible:ring-ring">
          <span>Developer sign-in</span>
          <span className="rounded-control border border-line bg-surface-strong px-2 py-1 type-caption">
            Demo access
          </span>
        </summary>
        <div className="border-t border-line px-surface-lg py-surface-lg">
          <DevSignInForm compact submitLabel="Continue here" />
        </div>
      </details>
    </aside>
  );
}
