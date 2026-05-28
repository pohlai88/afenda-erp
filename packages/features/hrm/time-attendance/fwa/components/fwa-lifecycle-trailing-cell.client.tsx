"use client"

import {
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
} from "@afenda/governed-surface/client"
import type { GovernedListTrailingCellProps } from "@afenda/governed-surface/client"

import { FwaLifecycleForms } from "./fwa-lifecycle-forms.client"

type FwaLifecycleRequestContext = {
  id: string
  dateRange: string
}

type FwaLifecycleTrailingContext = {
  requests: readonly FwaLifecycleRequestContext[]
}

export function FwaLifecycleTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const requests = (context as FwaLifecycleTrailingContext | undefined)
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
      <FwaLifecycleForms requestId={request.id} dateRange={request.dateRange} />
    </GovernedTrailingActionSlot>
  )
}
