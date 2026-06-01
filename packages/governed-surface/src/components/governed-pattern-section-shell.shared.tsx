import type { ReactNode } from "react";

import type { GovernedRenderableState } from "../schemas/governed-component-state.schema";
import { diagnosticsDataAttributes } from "../utils/governed-diagnostics.shared";
import {
  governedIdentityAttributes,
} from "../utils/governed-identity.shared";
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
  /** Surface identity. When set, emits canonical identity and diagnostics attrs. */
  surfaceKey?: string;
  /** Section identity; defaults to `surfaceKey` when omitted. */
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
  const renderState = body.state satisfies GovernedRenderableState;
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
    : diagnosticsDataAttributes({ testId: sectionTestId });

  const wrapperProps = {
    ...(sectionDomId ? { id: sectionDomId } : {}),
    className,
    ...contractAttrs,
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
