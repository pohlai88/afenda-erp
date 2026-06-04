import type { ReactNode } from "react";

import { cn } from "@afenda/ui/utils";

import type { GovernedRenderableState } from "./gov-governed-component-state-schema";
import { diagnosticsDataAttributes } from "../utils/governed-diagnostics.shared";
import {
  governedIdentityAttributes,
  governedTestId,
  toGovernedDomId,
} from "../utils/governed-identity.shared";
import { GovernedEmpty } from "./governed-empty";
import {
  GovernedSurfaceSectionCard,
  type GovernedSurfaceSectionCardBody,
} from "./governed-surface-section-card";

export type GovernedPatternSectionLayout = "card" | "embedded";

export type GovernedPatternSectionDensity = "comfortable" | "compact";

export function renderGovernedSectionCardBody(
  body: GovernedSurfaceSectionCardBody,
) {
  if (body.state === "ready") {
    return body.children;
  }

  return <GovernedEmpty model={body.model} />;
}

export type RenderGovernedPatternSectionShellInput = {
  layout: GovernedPatternSectionLayout;
  density?: GovernedPatternSectionDensity;

  surfaceKey: string;
  sectionKey: string;
  componentKey?: string;

  className?: string;
  sectionDomId?: string;

  headerSlot?: ReactNode;
  title: string;
  description?: string;
  headerAction?: ReactNode;

  body: GovernedSurfaceSectionCardBody;

  cardClassName?: string;
  contentClassName?: string;
};

export function renderGovernedPatternSectionShell({
  layout,
  density = "comfortable",
  surfaceKey,
  sectionKey,
  componentKey = sectionKey,
  className,
  sectionDomId,
  headerSlot,
  title,
  description,
  headerAction,
  body,
  cardClassName,
  contentClassName,
}: RenderGovernedPatternSectionShellInput) {
  const renderState: GovernedRenderableState = body.state;
  const resolvedSectionDomId =
    sectionDomId ?? toGovernedDomId("pattern-section", componentKey);

  const bodyComponentKey = `${componentKey}-body`;
  const cardComponentKey = `${componentKey}-card`;

  const sectionBody = renderGovernedSectionCardBody(body);

  const wrapperAttrs = {
    id: resolvedSectionDomId,
    className: cn("min-w-0", className),
    ...governedIdentityAttributes({
      surfaceKey,
      sectionKey,
      componentKey,
    }),
    ...diagnosticsDataAttributes({
      state: renderState,
      testId: governedTestId("pattern-section", componentKey),
    }),
  };

  if (layout === "embedded") {
    return (
      <section {...wrapperAttrs}>
        {headerSlot}

        <div
          className={cn("min-w-0", contentClassName)}
          {...governedIdentityAttributes({
            surfaceKey,
            sectionKey,
            componentKey: bodyComponentKey,
          })}
          {...diagnosticsDataAttributes({
            state: renderState,
            testId: governedTestId("pattern-section-body", componentKey),
          })}
        >
          {sectionBody}
        </div>
      </section>
    );
  }

  return (
    <section {...wrapperAttrs}>
      {headerSlot}

      <GovernedSurfaceSectionCard
        title={title}
        description={description}
        body={body}
        headerAction={headerAction}
        density={density}
        className={cardClassName}
        contentClassName={contentClassName}
        surfaceKey={surfaceKey}
        sectionKey={sectionKey}
        componentKey={cardComponentKey}
      />
    </section>
  );
}
