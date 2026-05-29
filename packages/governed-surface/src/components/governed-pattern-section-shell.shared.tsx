import type { ReactNode } from "react";

import { GovernedEmpty } from "./governed-empty";
import {
  GovernedSurfaceSectionCard,
  type GovernedSurfaceSectionCardBody,
} from "./governed-surface-section-card";

export type GovernedPatternSectionLayout = "card" | "embedded";

/** Section spacing — maps to Card size and content gap tokens. */
export type GovernedPatternSectionDensity = "comfortable" | "compact";

/**
 * Section shell layout:
 * - `card` — full CardHeader with title, description, and optional headerAction.
 * - `embedded` — parent owns chrome; inner section renders body only (no title/description).
 */
export type GovernedPatternSectionLayoutDoc = GovernedPatternSectionLayout;

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
  /** Maps to Card size and content gap tokens. Default `comfortable`. */
  density?: GovernedPatternSectionDensity;
  className?: string;
  sectionTestId: string;
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
  className,
  sectionTestId,
  sectionDomId,
  headerSlot,
  title,
  description,
  headerAction,
  body,
  cardClassName,
  contentClassName,
}: RenderGovernedPatternSectionShellInput) {
  const sectionBody = renderGovernedSectionCardBody(body);

  const wrapperProps = {
    ...(sectionDomId ? { id: sectionDomId } : {}),
    className,
    "data-testid": sectionTestId,
  } as const;

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
