"use client"

import {
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
} from "@afenda/governed-surface/client"
import type { GovernedListTrailingCellProps } from "@afenda/governed-surface/client"

import type { OtmApprovalStage } from "../data/otm-approval-snapshot.shared"
import { OtmDecisionForms } from "./otm-decision-form"

type OtmRequestContext = {
  id: string
  workDate: string
  startTime: string
  endTime: string
  approvalStage: OtmApprovalStage
}

type OtmDecisionTrailingContext = {
  requests: readonly OtmRequestContext[]
}

export function OtmDecisionTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const requests = (context as OtmDecisionTrailingContext | undefined)?.requests
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
      <OtmDecisionForms
        requestId={request.id}
        timeRange={`${request.workDate} · ${request.startTime}–${request.endTime}`}
        workDate={request.workDate}
        startTime={request.startTime}
        endTime={request.endTime}
        approvalStage={request.approvalStage}
      />
    </GovernedTrailingActionSlot>
  )
}
