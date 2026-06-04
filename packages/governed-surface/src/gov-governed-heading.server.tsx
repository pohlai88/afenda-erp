import type { ReactNode } from "react";
import Link from "next/link";

import { Button } from "@afenda/ui/button";
import { cn } from "@afenda/ui/utils";

import type { GovernedRenderableState } from "./gov-governed-component-state-schema";
import type { PageHeader } from "./gov-page-header-schema";
import { diagnosticsDataAttributes } from "./gov-governed-diagnostics-shared";
import {
  governedHeadingId,
  governedIdentityAttributes,
  governedTestId,
  toGovernedDomId,
} from "./gov-governed-identity-shared";
import { asGovernedRoute } from "./gov-governed-safe-route";

import { ModulePageHeader } from "./gov-module-page-header";

export type GovernedSurfaceProps = {
  header: PageHeader;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;

  /**
   * Required governed ERP surface identity.
   */
  surfaceKey: string;

  /**
   * Optional section identity within the surface.
   */
  sectionKey?: string;

  /**
   * Stable component identity for diagnostics, DOM id, and test hooks.
   */
  componentKey?: string;

  renderState?: GovernedRenderableState;
};

/**
 * Governed RSC surface shell.
 *
 * Responsibilities:
 * - owns page-level governed identity
 * - composes approved header/action/content regions
 * - exposes stable diagnostics and test hooks
 * - keeps route safety at the shell boundary
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
  const headerComponentKey = `${componentKey}-header`;
  const actionsComponentKey = `${componentKey}-actions`;
  const contentComponentKey = `${componentKey}-content`;

  const backHref = header.backHref;
  const backLabel = header.backLabel;
  const hasActions = Boolean(actions);

  return (
    <section
      id={surfaceDomId}
      className={cn("flex flex-col gap-surface-lg", className)}
      aria-labelledby={governedHeadingId("page-header", headerComponentKey)}
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
            componentKey={headerComponentKey}
          />

          {backHref && backLabel ? (
            <Button
              variant="link"
              className="h-auto w-fit p-0 type-control"
              asChild
              {...diagnosticsDataAttributes({
                state: renderState,
                testId: governedTestId("surface-back-link", componentKey),
              })}
            >
              <Link href={asGovernedRoute(backHref)} prefetch={false}>
                {backLabel}
              </Link>
            </Button>
          ) : null}
        </div>

        {hasActions ? (
          <div
            className="flex shrink-0 items-center gap-2"
            aria-label="Page actions"
            {...governedIdentityAttributes({
              surfaceKey,
              sectionKey,
              componentKey: actionsComponentKey,
            })}
            {...diagnosticsDataAttributes({
              state: renderState,
              testId: governedTestId("surface-actions", componentKey),
            })}
          >
            {actions}
          </div>
        ) : null}
      </div>

      <div
        className="min-w-0"
        {...governedIdentityAttributes({
          surfaceKey,
          sectionKey,
          componentKey: contentComponentKey,
        })}
        {...diagnosticsDataAttributes({
          state: renderState,
          testId: governedTestId("surface-content", componentKey),
        })}
      >
        {children}
      </div>
    </section>
  );
}
