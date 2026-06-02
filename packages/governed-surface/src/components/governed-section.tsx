import type { ReactNode } from "react";

import { cn } from "@afenda/ui/utils";

import type { GovernedRenderableState } from "../schemas/governed-component-state.schema";
import { diagnosticsDataAttributes } from "../utils/governed-diagnostics.shared";
import { GovernedHeading } from "../utils/governed-heading.shared";
import {
  governedDescriptionId,
  governedHeadingId,
  governedIdentityAttributes,
  governedTestId,
  toGovernedDomId,
} from "../utils/governed-identity.shared";

export type GovernedSectionProps = {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;

  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  descriptionClassName?: string;

  surfaceKey: string;
  sectionKey: string;
  componentKey?: string;

  headingLevel?: 2 | 3 | 4;
  renderState?: GovernedRenderableState;
};

export function GovernedSection({
  title,
  description,
  children,
  className,
  headerClassName,
  bodyClassName,
  descriptionClassName,
  surfaceKey,
  sectionKey,
  componentKey = sectionKey,
  headingLevel = 3,
  renderState = "ready",
}: GovernedSectionProps) {
  const sectionDomId = toGovernedDomId("governed-section", componentKey);
  const headingId = governedHeadingId("section", componentKey);
  const descriptionId = description
    ? governedDescriptionId("section", componentKey)
    : undefined;

  const bodyComponentKey = `${componentKey}-body`;

  return (
    <section
      id={sectionDomId}
      className={cn("flex flex-col gap-surface-md", className)}
      aria-labelledby={headingId}
      aria-describedby={descriptionId}
      {...governedIdentityAttributes({
        surfaceKey,
        sectionKey,
        componentKey,
      })}
      {...diagnosticsDataAttributes({
        state: renderState,
        testId: governedTestId("section", componentKey),
      })}
    >
      <div className={cn("flex flex-col gap-1", headerClassName)}>
        <GovernedHeading level={headingLevel} variant="section" id={headingId}>
          {title}
        </GovernedHeading>

        {description ? (
          <p id={descriptionId} className={cn("type-muted max-w-prose", descriptionClassName)}>
            {description}
          </p>
        ) : null}
      </div>

      <div
        className={cn("min-w-0", bodyClassName)}
        {...governedIdentityAttributes({
          surfaceKey,
          sectionKey,
          componentKey: bodyComponentKey,
        })}
        {...diagnosticsDataAttributes({
          state: renderState,
          testId: governedTestId("section-body", componentKey),
        })}
      >
        {children}
      </div>
    </section>
  );
}
