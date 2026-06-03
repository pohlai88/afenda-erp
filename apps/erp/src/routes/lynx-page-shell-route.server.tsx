import { GovernedComponentRenderer } from "@afenda/governed-surface/metadata";
import type {
  ListSurfaceRendererConfigurationResolvedInput,
  StatCardConfigurationResolvedInput,
} from "@afenda/governed-surface";
import Link from "next/link";
import type { ReactNode } from "react";

export function LynxPageShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="surface-page text-foreground">
      <div className="page-shell page-stack">
        <header className="section-stack border-b border-border pb-surface-lg">
          <div className="max-w-3xl">
            <p className="type-section-label">Lynx</p>
            <h1 className="mt-surface-sm type-page-title">{title}</h1>
            <p className="mt-surface-sm type-muted">
              {description}
            </p>
          </div>
          {actions ? (
            <nav aria-label="Lynx sections" className="flex flex-wrap gap-surface-sm">
              {actions}
            </nav>
          ) : null}
        </header>
        {children}
      </div>
    </main>
  );
}

export function LynxPageLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      className="inline-flex h-9 items-center rounded-control border border-border px-surface-sm type-control outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      href={href}
    >
      {children}
    </Link>
  );
}

export function GovernedStatSection({
  title,
  model,
}: {
  title?: string;
  model: StatCardConfigurationResolvedInput;
}) {
  return (
    <section aria-label={title ?? "Lynx statistics"} className="section-stack">
      {title ? <h2 className="type-section-title">{title}</h2> : null}
      <GovernedComponentRenderer
        component={{
          type: "governed:stat-card",
          serverType: "stat-card",
          configuration: model,
        }}
      />
    </section>
  );
}

export function GovernedListSection({
  title,
  model,
}: {
  title?: string;
  model: ListSurfaceRendererConfigurationResolvedInput;
}) {
  return (
    <section aria-label={title ?? "Lynx list"} className="section-stack">
      {title ? <h2 className="type-section-title">{title}</h2> : null}
      <GovernedComponentRenderer
        component={{
          type: "governed:list-surface",
          serverType: "list-surface",
          configuration: model,
        }}
      />
    </section>
  );
}
