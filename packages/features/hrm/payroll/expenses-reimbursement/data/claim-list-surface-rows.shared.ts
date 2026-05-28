import type {
  ListSurfaceRow,
  ListSurfaceRowTone,
} from "@afenda/governed-surface"

import { resolveClaimDisplayState } from "./claim-state.shared"
import type { ClaimRow } from "./claim.queries.server"

export const CLAIM_LIST_READ_PERMISSION = {
  module: "hrm" as const,
  object: "claim" as const,
  function: "read" as const,
}

export type ClaimListStateLabels = Readonly<Record<string, string>>

export function resolveClaimStateLabel(
  row: Pick<ClaimRow, "state" | "currentApprovalId">,
  stateLabels: ClaimListStateLabels
): string {
  const displayState = resolveClaimDisplayState({
    state: row.state,
    hasPendingApproval: Boolean(row.currentApprovalId),
  })
  const stateKey = displayState === "under_review" ? "under_review" : row.state
  return stateLabels[stateKey] ?? stateKey
}

export function resolveClaimListRowTone(
  row: Pick<ClaimRow, "state" | "currentApprovalId">
): ListSurfaceRowTone {
  const displayState = resolveClaimDisplayState({
    state: row.state,
    hasPendingApproval: Boolean(row.currentApprovalId),
  })
  if (displayState === "rejected" || displayState === "returned") {
    return "critical"
  }
  if (
    displayState === "under_review" ||
    displayState === "submitted" ||
    row.state === "draft"
  ) {
    return "attention"
  }
  return "default"
}

export function mapClaimRowToListSurfaceRow(input: {
  row: ClaimRow
  rowHref?: string
  linkColumnId?: string
  stateLabels: ClaimListStateLabels
  formatEvidenceCount: (count: number) => string
  includeEmployee?: boolean
}): ListSurfaceRow {
  const rowHref = input.rowHref
  const displayState = resolveClaimDisplayState({
    state: input.row.state,
    hasPendingApproval: Boolean(input.row.currentApprovalId),
  })
  const cells: Record<string, string | number | boolean> = {
    claimType: input.row.claimTypeCode,
    claimDate: input.row.claimDate,
    amount: `${input.row.amount} ${input.row.currency}`,
    state: resolveClaimStateLabel(input.row, input.stateLabels),
    submitted: input.row.submittedAt
      ? input.row.submittedAt.toISOString()
      : input.row.createdAt.toISOString(),
    evidence: input.formatEvidenceCount(input.row.evidenceCount),
  }

  if (input.includeEmployee !== false) {
    cells.employee = input.row.employeeFullName ?? input.row.employeeId
  }

  return {
    id: input.row.id,
    rowTone: resolveClaimListRowTone(input.row),
    ...(rowHref ? { rowHref, linkColumnId: input.linkColumnId } : {}),
    cells,
    decisionLedger: {
      reason:
        input.row.description ??
        `${input.row.claimTypeName} ${input.row.amount} ${input.row.currency}`,
      ...(rowHref
        ? {
            evidenceHref: `${rowHref}#evidence`,
            policyHref: `${rowHref}#policy`,
          }
        : {}),
      policyLabel: input.row.policyEvidenceRequired
        ? "Evidence required"
        : "Claim policy",
      actorLabel:
        input.row.decidedByUserId ??
        input.row.submittedByUserId ??
        input.row.employeeFullName ??
        input.row.employeeId,
      occurredAt: (
        input.row.decidedAt ??
        input.row.submittedAt ??
        input.row.updatedAt
      ).toISOString(),
      riskTone:
        displayState === "rejected" || displayState === "returned"
          ? "critical"
          : input.row.requiresEvidence && input.row.evidenceCount === 0
            ? "critical"
            : displayState === "under_review" || displayState === "submitted"
              ? "attention"
              : "default",
      nextActionLabel:
        input.row.requiresEvidence && input.row.evidenceCount === 0
          ? "Attach evidence"
          : resolveClaimStateLabel(input.row, input.stateLabels),
    },
  }
}
