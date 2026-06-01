import { diagnosticsDataAttributes } from "../utils/governed-diagnostics.shared";
import { GovernedHeading } from "../utils/governed-heading.shared";
import {
  governedDescriptionId,
  governedHeadingId,
  governedIdentityAttributes,
  governedTestId,
} from "../utils/governed-identity.shared";

export type ModulePageHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  surfaceKey?: string;
  sectionKey?: string;
  componentKey?: string;
};

export function ModulePageHeader({
  title,
  description,
  eyebrow,
  surfaceKey,
  sectionKey,
  componentKey = surfaceKey ?? "page-header",
}: ModulePageHeaderProps) {
  const headingId = governedHeadingId("page-header", componentKey);
  const descriptionId = governedDescriptionId("page-header", componentKey);
  const contractAttrs = {
    ...governedIdentityAttributes({
      surfaceKey,
      sectionKey,
      componentKey,
    }),
    ...diagnosticsDataAttributes({
      state: "ready",
      testId: governedTestId("page-header", componentKey),
    }),
  };

  return (
    <header
      className="flex flex-col gap-surface-xs"
      aria-labelledby={headingId}
      {...(description ? { "aria-describedby": descriptionId } : {})}
      {...contractAttrs}
    >
      {eyebrow ? <p className="type-label">{eyebrow}</p> : null}
      <GovernedHeading level={2} variant="page" id={headingId}>
        {title}
      </GovernedHeading>
      {description ? (
        <p className="type-muted" id={descriptionId}>
          {description}
        </p>
      ) : null}
    </header>
  );
}
