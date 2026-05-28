"use client"

import {
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
} from "@afenda/governed-surface/client"
import type { GovernedListTrailingCellProps } from "@afenda/governed-surface/client"

import { AttendanceCorrectionDialog } from "./attendance-correction-dialog"

type AttendanceRecentTrailingContext = {
  events: readonly {
    id: string
    occurredAtIso: string
    eventType: string
  }[]
}

export function AttendanceRecentTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const events = (context as AttendanceRecentTrailingContext | undefined)
    ?.events
  const event = events?.find((entry) => entry.id === row.id)
  const trailingAction = row.trailingAction
  if (!event || !isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null
  }
  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <AttendanceCorrectionDialog
        originalEventId={event.id}
        occurredAtIso={event.occurredAtIso}
        eventType={event.eventType}
      />
    </GovernedTrailingActionSlot>
  )
}
