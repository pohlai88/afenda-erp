import type { ReactNode } from "react";

import { diagnosticsDataAttributes } from "./gov-governed-diagnostics-shared";
import { GovernedHeading } from "./gov-governed-heading-shared";
import {
  governedDescriptionId,
  governedHeadingId,
  governedIdentityAttributes,
  governedTestId,
} from "./gov-governed-identity-shared";

export type ModulePageHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;

  /**
   * Required governed surface identity.
   * Example: "hr-suite", "system-admin", "inventory".
   */
  surfaceKey: string;

  /**
   * Optional section identity inside the surface.
   * Example: "time-attendance", "audit-viewer".
   */
  sectionKey?: string;

  /**
   * Stable component identity.
   * Override only when multiple page headers exist in one governed surface.
   */
  componentKey?: string;

  /**
   * Defaults to h2 because this is usually rendered below the app/module shell.
   */
  headingLevel?: 1 | 2 | 3;

  className?: string;
  eyebrowClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
};

export function ModulePageHeader({
  title,
  description,
  eyebrow,
  surfaceKey,
  sectionKey,
  componentKey = `${surfaceKey}-page-header`,
  headingLevel = 2,
  className,
  eyebrowClassName,
  titleClassName,
  descriptionClassName,
}: ModulePageHeaderProps) {
  const headingId = governedHeadingId("page-header", componentKey);
  const descriptionId = governedDescriptionId("page-header", componentKey);

  const hasDescription = Boolean(description);

  return (
    <header
      className={["flex flex-col gap-surface-xs", className]
        .filter(Boolean)
        .join(" ")}
      aria-labelledby={headingId}
      aria-describedby={hasDescription ? descriptionId : undefined}
      {...governedIdentityAttributes({
        surfaceKey,
        sectionKey,
        componentKey,
      })}
      {...diagnosticsDataAttributes({
        state: "ready",
        testId: governedTestId("page-header", componentKey),
      })}
    >
      {eyebrow ? (
        <p className={["type-label", eyebrowClassName].filter(Boolean).join(" ")}>
          {eyebrow}
        </p>
      ) : null}

      <GovernedHeading
        level={headingLevel}
        variant="page"
        id={headingId}
        className={titleClassName}
      >
        {title}
      </GovernedHeading>

      {hasDescription ? (
        <p
          id={descriptionId}
          className={["type-muted max-w-prose", descriptionClassName]
            .filter(Boolean)
            .join(" ")}
        >
          {description}
        </p>
      ) : null}
    </header>
  );
}
