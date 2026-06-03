export default function LynxLoading() {
  return (
    <main aria-busy="true" className="surface-page text-foreground">
      <div className="page-shell page-stack">
        <div className="h-24 rounded-section border border-border bg-muted/40" />
        <div className="grid gap-surface-md">
          <div className="h-28 rounded-section border border-border bg-muted/40" />
          <div className="h-28 rounded-section border border-border bg-muted/40" />
          <div className="h-28 rounded-section border border-border bg-muted/40" />
        </div>
        <div className="h-80 rounded-section border border-border bg-muted/40" />
      </div>
    </main>
  );
}
