import "server-only";

import type { ReactNode } from "react";
import { cn } from "@afenda/ui/utils";

import { MetadataUiPrimitiveBadge } from "./badge.server";
import { MetadataUiPrimitiveCard } from "./card.server";
import type { MetadataUiScorecardCriterion } from "../schemas/scorecard-form.schema";

export type MetadataUiPrimitiveScorecardCriterionCardProps = Readonly<{
  criterion: MetadataUiScorecardCriterion;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}>;

export function MetadataUiPrimitiveScorecardCriterionCard({
  criterion,
  children,
  className,
  contentClassName,
}: MetadataUiPrimitiveScorecardCriterionCardProps) {
  const statusBadge = criterion.blockedReason ? (
    <MetadataUiPrimitiveBadge tone="warning">Blocked</MetadataUiPrimitiveBadge>
  ) : criterion.readonly ? (
    <MetadataUiPrimitiveBadge tone="neutral">Readonly</MetadataUiPrimitiveBadge>
  ) : criterion.required ? (
    <MetadataUiPrimitiveBadge tone="info">Required</MetadataUiPrimitiveBadge>
  ) : null;

  return (
    <MetadataUiPrimitiveCard
      className={cn("metadata-ui-scorecard-criterion-card", className)}
      title={
        <span id={`${criterion.key}-label`}>
          {criterion.label}
          {criterion.required ? <span aria-hidden="true"> *</span> : null}
        </span>
      }
      description={criterion.description}
      meta={statusBadge}
      contentClassName={cn("grid gap-surface-sm", contentClassName)}
    >
      {children}
    </MetadataUiPrimitiveCard>
  );
}
