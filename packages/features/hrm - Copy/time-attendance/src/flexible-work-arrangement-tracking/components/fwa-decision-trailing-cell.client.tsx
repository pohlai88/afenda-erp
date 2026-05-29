"use client"

import {
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
} from "@afenda/governed-surface/client"
import type { GovernedListTrailingCellProps } from "@afenda/governed-surface/client"

import { FwaDecisionForms } from "./fwa-decision-form"

type FwaRequestContext = {
  id: string
  dateRange: string
}

type FwaDecisionTrailingContext = {
  requests: readonly FwaRequestContext[]
}

export function FwaDecisionTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const requests = (context as FwaDecisionTrailingContext | undefined)?.requests
  const request = requests?.find((entry) => entry.id === row.id)
  if (!request) {
    return null
  }
  const trailingAction = row.trailingAction
  if (!isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null
  }
  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <FwaDecisionForms requestId={request.id} dateRange={request.dateRange} />
    </GovernedTrailingActionSlot>
  )
}
