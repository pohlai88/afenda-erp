"use client"

import {
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
} from "@afenda/governed-surface/client"
import type { GovernedListTrailingCellProps } from "@afenda/governed-surface/client"

import type { LeaveTypeAdminRow } from "../data/leave-policy.queries.server"
import { LeaveTypeEditDialog } from "./policies-leave-type-edit-dialog"

type PoliciesLeaveTypesTrailingContext = {
  rows: readonly LeaveTypeAdminRow[]
}

export function PoliciesLeaveTypesTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const ctx = context as PoliciesLeaveTypesTrailingContext | undefined
  const leaveType = ctx?.rows.find((entry) => entry.id === row.id)
  const trailingAction = row.trailingAction
  if (!leaveType || !isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null
  }
  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <LeaveTypeEditDialog row={leaveType} />
    </GovernedTrailingActionSlot>
  )
}
