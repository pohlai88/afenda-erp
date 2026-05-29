import type { Route } from "next";
import type { ReactNode } from "react";

import { Button } from "@afenda/ui/button";
import { ModulePageHeader } from "./module-page-header";
import Link from "next/link";
import { cn } from "@afenda/ui/utils";

import type { PageHeader } from "../schemas/page-header.schema";

export type GovernedSurfaceProps = {
  header: PageHeader;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
};

/**
 * Thin RSC shell — composes approved primitives only (renderer capability ceiling).
 * Callers resolve all copy and locale-internal paths before passing metadata in.
 */
export function GovernedSurface({
  header,
  children,
  actions,
  className,
}: GovernedSurfaceProps) {
  const backHref = header.backHref;
  const backLabel = header.backLabel;

  return (
    <div className={cn("flex flex-col gap-surface-lg", className)}>
      <div className="@container flex flex-col gap-3 @md:flex-row @md:items-start @md:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <ModulePageHeader
            eyebrow={header.eyebrow}
            title={header.title}
            description={header.description}
          />
          {backHref && backLabel ? (
            <Button
              variant="link"
              className="h-auto p-0 type-control"
              asChild
            >
              <Link href={backHref as Route} prefetch={false}>
                {backLabel}
              </Link>
            </Button>
          ) : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      {children}
    </div>
  );
}
