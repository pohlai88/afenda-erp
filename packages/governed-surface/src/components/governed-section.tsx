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
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  surfaceKey?: string;
  sectionKey: string;
  componentKey?: string;
  renderState?: GovernedRenderableState;
};

export function GovernedSection({
  title,
  description,
  children,
  className,
  surfaceKey,
  sectionKey,
  componentKey = sectionKey,
  renderState = "ready",
}: GovernedSectionProps) {
  const sectionDomId = toGovernedDomId("governed-section", componentKey);
  const headingId = governedHeadingId("section", componentKey);
  const descriptionId = governedDescriptionId("section", componentKey);

  return (
    <section
      id={sectionDomId}
      className={cn("flex flex-col gap-surface-md", className)}
      aria-labelledby={headingId}
      aria-describedby={description ? descriptionId : undefined}
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
      <div className="flex flex-col gap-1">
        <GovernedHeading level={3} variant="section" id={headingId}>
          {title}
        </GovernedHeading>

        {description ? (
          <p className="type-muted" id={descriptionId}>
            {description}
          </p>
        ) : null}
      </div>

      {children}
    </section>
  );
}
