"use client"

import {
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
} from "@afenda/governed-surface/client"
import type { GovernedListTrailingCellProps } from "@afenda/governed-surface/client"

import type { HrmOtmRequestState } from "../schemas/otm-workflow-state.shared"
import { OtmMyRequestActions } from "./otm-my-request-actions.client"

type OtmMyRequestContext = {
  id: string
  state: HrmOtmRequestState
  timeRange: string
}

type OtmMyRequestTrailingContext = {
  requests: readonly OtmMyRequestContext[]
}

export function OtmMyRequestTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const requests = (context as OtmMyRequestTrailingContext | undefined)
    ?.requests
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
      <OtmMyRequestActions
        requestId={request.id}
        state={request.state}
        timeRange={request.timeRange}
      />
    </GovernedTrailingActionSlot>
  )
}
