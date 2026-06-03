import "server-only";

/** Shown on `/account` until tenant session (phase C) wires workspace navigation. */
export function PreLoginAccountNotice() {
  return (
    <div
      className="mx-auto mb-6 max-w-2xl rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground"
      role="status"
    >
      Signed in with Neon Auth. Workspace modules and tenant capabilities arrive in phase C
      — use account settings here; avoid `/dashboard` until tenant session is restored.
    </div>
  );
}
