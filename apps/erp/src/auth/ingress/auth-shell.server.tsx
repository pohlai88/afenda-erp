import "server-only";

import {
  appBrandName,
  authShellCopy,
  getAuthPageMetadataCopy,
  type AuthPageMetadataKey,
} from "@afenda/kernel";
import { Badge } from "@afenda/ui/badge";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AuthFlowRail } from "./auth-flow-rail.server";

export function createAuthPageMetadata(key: AuthPageMetadataKey): Metadata {
  const pageMetadata = getAuthPageMetadataCopy(key);

  return {
    title: pageMetadata.title,
    description: pageMetadata.description,
  };
}

const capabilityTiles = [
  {
    title: "Tenant isolation",
    detail: "Organization context resolves server-side.",
  },
  {
    title: "Capability gates",
    detail: "Role checks run before protected work.",
  },
  {
    title: "Branch-aware auth",
    detail: "Auth follows the active database branch.",
  },
] as const;

export function AuthShell({
  pageKey,
  eyebrow = authShellCopy.hero.eyebrow,
  title,
  description,
  children,
  footer,
}: {
  pageKey?: AuthPageMetadataKey;
  eyebrow?: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col bg-surface-inset px-surface-lg py-surface-2xl text-foreground sm:px-surface-2xl lg:px-surface-3xl">
      <section className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-surface-xl">
        <header className="flex flex-col gap-surface-lg">
          <div className="flex items-center gap-surface-md">
            <div
              aria-hidden
              className="flex size-10 shrink-0 items-center justify-center rounded-control border border-line bg-card font-heading text-lg font-semibold text-foreground shadow-elevation-1"
            >
              A
            </div>
            <div className="min-w-0">
              <p className="type-label text-muted-foreground">{eyebrow}</p>
              <p className="truncate type-card-title font-semibold">
                {appBrandName}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-surface-md">
            <Badge className="w-fit" variant="info">
              Enterprise access
            </Badge>
            <div className="flex flex-col gap-surface-sm">
              <h1 className="type-page-title font-semibold leading-tight">
                {title}
              </h1>
              <p className="max-w-xl type-body leading-7 text-muted-foreground">
                {description}
              </p>
            </div>
            <AuthFlowRail pageKey={pageKey} />
          </div>
        </header>

        <div className="rounded-panel border border-line bg-card p-surface-lg shadow-elevation-2 sm:p-surface-xl">
          {children}
        </div>

        <div className="grid gap-surface-md sm:grid-cols-3">
          {capabilityTiles.map((tile) => (
            <div
              key={tile.title}
              className="rounded-section border border-line bg-card px-surface-md py-surface-md"
            >
              <p className="type-label font-medium text-foreground">
                {tile.title}
              </p>
              <p className="mt-1 type-caption leading-5 text-muted-foreground">
                {tile.detail}
              </p>
            </div>
          ))}
        </div>

        {footer ? (
          <div className="border-t border-line pt-surface-lg text-center type-muted">
            {footer}
          </div>
        ) : null}
      </section>
    </main>
  );
}

export { appBrandName };
