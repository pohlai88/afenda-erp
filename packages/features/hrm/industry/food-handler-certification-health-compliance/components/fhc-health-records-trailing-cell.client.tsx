"use client"

import {
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
} from "@afenda/governed-surface/client"
import type { GovernedListTrailingCellProps } from "@afenda/governed-surface/client"

import type { FhcHealthRecordRow } from "../data/fhc.types.shared"
import { FhcHealthDetailDialog } from "./fhc-health-detail-dialog.client"

type FhcHealthRecordsTrailingContext = {
  canReadHealthDetails: boolean
  records: readonly FhcHealthRecordRow[]
}

export function FhcHealthRecordsTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const ctx = context as FhcHealthRecordsTrailingContext | undefined
  const record = ctx?.records.find((entry) => entry.id === row.id)
  const trailingAction = row.trailingAction
  if (
    !ctx ||
    !record ||
    !isListSurfaceTrailingActionRenderable(trailingAction)
  ) {
    return null
  }
  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <FhcHealthDetailDialog
        record={record}
        canReadHealthDetails={ctx.canReadHealthDetails}
      />
    </GovernedTrailingActionSlot>
  )
}
