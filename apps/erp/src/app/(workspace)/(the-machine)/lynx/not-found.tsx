import { LYNX_WORKSPACE_ROUTES } from "@afenda/feature-lynx/server";
import Link from "next/link";

export default function LynxNotFound() {
  return (
    <main className="surface-page text-foreground">
      <section className="page-shell section-stack">
        <div className="surface-section p-surface-lg">
          <p className="type-section-label">Lynx</p>
          <h1 className="type-section-title">Lynx record not found</h1>
          <p className="type-muted">
            The requested run or workflow session does not exist in the active
            organization.
          </p>
          <Link
            className="mt-surface-md inline-flex h-9 w-fit items-center rounded-control border border-border px-surface-sm type-control outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            href={LYNX_WORKSPACE_ROUTES.console}
          >
            Return to Lynx
          </Link>
        </div>
      </section>
    </main>
  );
}
