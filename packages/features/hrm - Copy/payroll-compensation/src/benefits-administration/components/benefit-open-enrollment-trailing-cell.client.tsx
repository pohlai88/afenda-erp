"use client"

import {
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
} from "@afenda/governed-surface/client"
import type { GovernedListTrailingCellProps } from "@afenda/governed-surface/client"

import { BenefitOpenEnrollmentCloseButton } from "./benefit-open-enrollment-close-button.client"

type BenefitOpenEnrollmentTrailingContext = {
  windows: readonly { id: string; isActive: boolean }[]
}

export function BenefitOpenEnrollmentTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const windows = (context as BenefitOpenEnrollmentTrailingContext | undefined)
    ?.windows
  const window = windows?.find((entry) => entry.id === row.id)
  const trailingAction = row.trailingAction
  if (
    !window?.isActive ||
    !isListSurfaceTrailingActionRenderable(trailingAction)
  ) {
    return null
  }
  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <BenefitOpenEnrollmentCloseButton windowId={window.id} />
    </GovernedTrailingActionSlot>
  )
}
