"use client"

import {
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
} from "@afenda/governed-surface/client"
import type { GovernedListTrailingCellProps } from "@afenda/governed-surface/client"

import type {
  FhcEmployeeObligationRow,
  FhcEvidenceDocumentChoiceRow,
} from "../data/fhc.types.shared"
import { FhcObligationRecordsTrailing } from "./fhc-obligation-records-trailing.client"

type FhcObligationsTrailingContext = {
  canAudit: boolean
  obligations: readonly FhcEmployeeObligationRow[]
  documentChoicesByEmployeeId: Record<string, FhcEvidenceDocumentChoiceRow[]>
}

export function FhcObligationsTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const ctx = context as FhcObligationsTrailingContext | undefined
  const obligation = ctx?.obligations.find((entry) => entry.id === row.id)
  const trailingAction = row.trailingAction
  if (
    !ctx ||
    !obligation ||
    !isListSurfaceTrailingActionRenderable(trailingAction)
  ) {
    return null
  }
  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <FhcObligationRecordsTrailing
        obligation={obligation}
        canAudit={ctx.canAudit}
        documentChoices={
          ctx.documentChoicesByEmployeeId[obligation.employeeId] ?? []
        }
      />
    </GovernedTrailingActionSlot>
  )
}
