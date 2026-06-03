import "server-only";

export function NeonAuthUiNotReadyPanel() {
  return (
    <main className="neon-auth-ui-page flex w-full min-h-[50vh] items-center justify-center p-6">
      <div className="max-w-md space-y-3 text-center">
        <h1 className="text-lg font-semibold">Neon Auth UI unavailable</h1>
        <p className="text-sm text-muted-foreground">
          Enable Neon Auth and set <code>AFENDA_NEON_AUTH_ENABLED=1</code>,{" "}
          <code>NEXT_PUBLIC_AFENDA_NEON_AUTH_ENABLED=1</code>,{" "}
          <code>NEON_AUTH_BASE_URL</code>, and <code>NEXT_PUBLIC_AUTH_URL</code>, then run{" "}
          <code>pnpm env:sync</code>.
        </p>
      </div>
    </main>
  );
}
