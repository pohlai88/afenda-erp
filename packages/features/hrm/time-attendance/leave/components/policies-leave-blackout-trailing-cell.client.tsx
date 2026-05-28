"use client"

import {
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
} from "@afenda/governed-surface/client"
import type { GovernedListTrailingCellProps } from "@afenda/governed-surface/client"

import { PoliciesLeaveBlackoutArchiveButton } from "./policies-leave-blackout-archive-button.client"

export function PoliciesLeaveBlackoutTrailingCell({
  row,
}: GovernedListTrailingCellProps) {
  const trailingAction = row.trailingAction
  if (!isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null
  }
  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <PoliciesLeaveBlackoutArchiveButton blackoutId={row.id} />
    </GovernedTrailingActionSlot>
  )
}
