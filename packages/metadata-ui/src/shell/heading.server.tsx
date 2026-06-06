import "server-only";

import type { ReactNode } from "react";
import { ui } from "@afenda/ui/design-system";
import { cn } from "@afenda/ui/utils";

import type { MetadataUiPresentationContract } from "../contracts/presentation.contract";
import { shouldRenderMetadataUiPresentationDescription } from "../presentation/resolve-visibility.shared";

export type MetadataUiHeadingLevel = 1 | 2 | 3 | 4;

export type MetadataUiHeadingProps = Readonly<{
  id?: string;
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  actions?: ReactNode;
  level?: MetadataUiHeadingLevel;
  presentation?: MetadataUiPresentationContract;
}>;

const HEADING_CLASS_BY_LEVEL = {
  1: ui.typography.pageTitle,
  2: ui.typography.sectionTitle,
  3: ui.typography.cardTitle,
  4: ui.typography.subtitle,
} as const satisfies Record<MetadataUiHeadingLevel, string>;

export function MetadataUiHeading({
  id,
  title,
  description,
  eyebrow,
  actions,
  level = 2,
  presentation,
}: MetadataUiHeadingProps) {
  const HeadingTag = `h${level}` as const;
  const showDescription =
    shouldRenderMetadataUiPresentationDescription(presentation) &&
    Boolean(description);

  return (
    <div
      className={cn(
        "metadata-ui-heading flex min-w-0 items-start justify-between",
        ui.surfaceGap.md,
      )}
    >
      <div className={cn("grid min-w-0", ui.surfaceGap.xs)}>
        {eyebrow ? (
          <p className={ui.typography.label}>{eyebrow}</p>
        ) : null}
        <HeadingTag id={id} className={HEADING_CLASS_BY_LEVEL[level]}>
          {title}
        </HeadingTag>
        {showDescription && description ? (
          <p className={cn("max-w-3xl", ui.typography.muted)}>
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
