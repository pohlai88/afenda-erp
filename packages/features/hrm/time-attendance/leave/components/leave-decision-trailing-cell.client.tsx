"use client"

import {
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
} from "@afenda/governed-surface/client"
import type { GovernedListTrailingCellProps } from "@afenda/governed-surface/client"

import { LeaveDecisionForms } from "./leave-decision-form"

type LeaveRequestContext = {
  id: string
  startDate: string
  endDate: string
}

type LeaveDecisionTrailingContext = {
  requests: readonly LeaveRequestContext[]
}

export function LeaveDecisionTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const requests = (context as LeaveDecisionTrailingContext | undefined)
    ?.requests
  if (!requests) {
    return null
  }
  const request = requests.find((entry) => entry.id === row.id)
  if (!request) {
    return null
  }
  const trailingAction = row.trailingAction
  if (!isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null
  }
  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <LeaveDecisionForms
        requestId={request.id}
        dateRange={`${request.startDate} → ${request.endDate}`}
      />
    </GovernedTrailingActionSlot>
  )
}
