import type { ReactNode } from "react";
import Link from "next/link";

import { Button } from "@afenda/ui/button";
import { cn } from "@afenda/ui/utils";

import type { GovernedRenderableState } from "../schemas/governed-component-state.schema";
import type { PageHeader } from "../schemas/page-header.schema";
import { diagnosticsDataAttributes } from "../utils/governed-diagnostics.shared";
import {
  governedIdentityAttributes,
  governedTestId,
  toGovernedDomId,
} from "../utils/governed-identity.shared";
import { asGovernedRoute } from "../utils/governed-safe-route";

import { ModulePageHeader } from "./module-page-header";

export type GovernedSurfaceProps = {
  header: PageHeader;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
  surfaceKey: string;
  sectionKey?: string;
  componentKey?: string;
  renderState?: GovernedRenderableState;
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
  surfaceKey,
  sectionKey,
  componentKey = surfaceKey,
  renderState = "ready",
}: GovernedSurfaceProps) {
  const surfaceDomId = toGovernedDomId("governed-surface", componentKey);

  return (
    <section
      id={surfaceDomId}
      className={cn("flex flex-col gap-surface-lg", className)}
      {...governedIdentityAttributes({
        surfaceKey,
        sectionKey,
        componentKey,
      })}
      {...diagnosticsDataAttributes({
        state: renderState,
        testId: governedTestId("surface", componentKey),
      })}
    >
      <div className="@container flex flex-col gap-3 @md:flex-row @md:items-start @md:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <ModulePageHeader
            eyebrow={header.eyebrow}
            title={header.title}
            description={header.description}
            surfaceKey={surfaceKey}
            sectionKey={sectionKey}
            componentKey={`${componentKey}-header`}
          />

          {header.backHref && header.backLabel ? (
            <Button variant="link" className="h-auto p-0 type-control" asChild>
              <Link href={asGovernedRoute(header.backHref)} prefetch={false}>
                {header.backLabel}
              </Link>
            </Button>
          ) : null}
        </div>

        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>

      {children}
    </section>
  );
}
