"use client"

import type { GovernedListTrailingCellProps } from "@afenda/governed-surface/client"

import { ClaimDecisionForms } from "./claim-decision-form"

type ClaimRowContext = {
  id: string
  employeeId: string
  employeeFullName?: string | null
  claimTypeCode: string
  amount: string
  currency: string
}

type ClaimDecisionTrailingContext = {
  claims: readonly ClaimRowContext[]
}

export function ClaimDecisionTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const claims = (context as ClaimDecisionTrailingContext | undefined)?.claims
  if (!claims) {
    return null
  }
  const claim = claims.find((entry) => entry.id === row.id)
  if (!claim) {
    return null
  }
  const label = `${claim.employeeFullName ?? claim.employeeId} · ${claim.claimTypeCode} · ${claim.amount} ${claim.currency}`
  return (
    <ClaimDecisionForms
      claimId={claim.id}
      label={label}
      requestedAmount={claim.amount}
      currency={claim.currency}
    />
  )
}
