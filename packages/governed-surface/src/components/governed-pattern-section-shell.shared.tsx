import type { ReactNode } from "react";

import type { GovernedRenderableState } from "../schemas/governed-component-state.schema";
import { diagnosticsDataAttributes } from "../utils/governed-diagnostics.shared";
import { governedIdentityAttributes } from "../utils/governed-identity.shared";
import { GovernedEmpty } from "./governed-empty";
import {
  GovernedSurfaceSectionCard,
  type GovernedSurfaceSectionCardBody,
} from "./governed-surface-section-card";

export type GovernedPatternSectionLayout = "card" | "embedded";

/** Section spacing — maps to Card size and content gap tokens. */
export type GovernedPatternSectionDensity = "comfortable" | "compact";

/** Renders embedded-layout section content (forbidden/invalid → GovernedEmpty). */
export function renderGovernedSectionCardBody(
  body: GovernedSurfaceSectionCardBody,
) {
  if (body.state === "forbidden" || body.state === "invalid") {
    return <GovernedEmpty model={body.model} />;
  }

  return body.children;
}

export type RenderGovernedPatternSectionShellInput = {
  layout: GovernedPatternSectionLayout;
  density?: GovernedPatternSectionDensity;
  className?: string;
  sectionTestId: string;
  sectionDomId?: string;
  surfaceKey?: string;
  sectionKey?: string;
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
  className,
  sectionTestId,
  sectionDomId,
  surfaceKey,
  sectionKey,
  headerSlot,
  title,
  description,
  headerAction,
  body,
  cardClassName,
  contentClassName,
}: RenderGovernedPatternSectionShellInput) {
  const sectionBody = renderGovernedSectionCardBody(body);
  const resolvedSectionKey = sectionKey ?? surfaceKey;
  const renderState: GovernedRenderableState = body.state;

  const contractAttrs = surfaceKey
    ? {
        ...governedIdentityAttributes({
          surfaceKey,
          sectionKey: resolvedSectionKey,
          componentKey: resolvedSectionKey,
        }),
        ...diagnosticsDataAttributes({
          state: renderState,
          testId: sectionTestId,
        }),
      }
    : diagnosticsDataAttributes({
        state: renderState,
        testId: sectionTestId,
      });

  const wrapperProps = {
    ...(sectionDomId ? { id: sectionDomId } : {}),
    className,
    ...contractAttrs,
  };

  if (layout === "embedded") {
    return (
      <div {...wrapperProps}>
        {headerSlot}
        <div className={contentClassName}>{sectionBody}</div>
      </div>
    );
  }

  return (
    <div {...wrapperProps}>
      {headerSlot}
      <GovernedSurfaceSectionCard
        title={title}
        description={description}
        body={body}
        headerAction={headerAction}
        density={density}
        className={cardClassName}
        contentClassName={contentClassName}
      />
    </div>
  );
}
