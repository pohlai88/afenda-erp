"use client";

import {
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
  type GovernedListTrailingCellProps,
} from "@afenda/governed-surface/client";

import {
  HrCpmFinalizeApprovalForm,
  HrCpmHrReviewPanel,
  HrCpmRecommendationStatusBadge,
  HrCpmSubmitRecommendationForm,
} from "./hr.payroll.cpm-workflow-forms.component.client";

function readCpmTrailingCellValue(
  row: GovernedListTrailingCellProps["row"],
  cellId: string,
): string {
  const value = row.cells[cellId];
  if (value == null) {
    return "";
  }
  return String(value).trim();
}

export function HrCpmRecommendationsTrailingCell({
  row,
}: GovernedListTrailingCellProps) {
  if (!isListSurfaceTrailingActionRenderable(row.trailingAction)) {
    return null;
  }

  const status = readCpmTrailingCellValue(row, "recommendationStatus") || "draft";
  const lockedAt = readCpmTrailingCellValue(row, "lockedAt") || null;
  const canSubmit = readCpmTrailingCellValue(row, "canSubmitCpm") === "true";
  const canReview = readCpmTrailingCellValue(row, "canReviewCpm") === "true";
  const canFinalize = readCpmTrailingCellValue(row, "canFinalizeCpm") === "true";

  return (
    <GovernedTrailingActionSlot>
      <HrCpmRecommendationStatusBadge status={status} lockedAt={lockedAt} />
      <HrCpmSubmitRecommendationForm
        recommendationId={row.id}
        status={status}
        lockedAt={lockedAt}
        canSubmit={canSubmit}
      />
      <HrCpmHrReviewPanel
        recommendationId={row.id}
        status={status}
        lockedAt={lockedAt}
        canReview={canReview}
      />
      <HrCpmFinalizeApprovalForm
        recommendationId={row.id}
        status={status}
        lockedAt={lockedAt}
        canFinalize={canFinalize}
      />
    </GovernedTrailingActionSlot>
  );
}
