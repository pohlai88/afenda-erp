import { isDevCookieAuthEnabled } from "@afenda/config/env";
import { DevSignInForm } from "./dev-sign-in-form";

export function DevSignInFloatingPanel() {
  if (!isDevCookieAuthEnabled()) {
    return null;
  }

  return (
    <aside
      aria-label="Developer sign-in"
      className="fixed right-4 bottom-4 z-40 w-[calc(100vw-2rem)] max-w-sm sm:right-6 sm:bottom-6"
    >
      <details className="group rounded-lg border border-line bg-card shadow-lg">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-foreground outline-none transition hover:bg-surface-strong focus-visible:ring-2 focus-visible:ring-ring">
          <span>Developer sign-in</span>
          <span className="rounded-md border border-line bg-surface-strong px-2 py-1 text-xs text-muted-foreground">
            Demo access
          </span>
        </summary>
        <div className="border-t border-line px-4 py-4">
          <DevSignInForm compact submitLabel="Continue here" />
        </div>
      </details>
    </aside>
  );
}
