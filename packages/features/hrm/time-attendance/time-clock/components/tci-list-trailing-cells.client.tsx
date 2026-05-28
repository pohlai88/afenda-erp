"use client"

import {
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
} from "@afenda/governed-surface/client"
import type { GovernedListTrailingCellProps } from "@afenda/governed-surface/client"

import { TimeClockExceptionDecisionForms } from "./tci-exception-decision-forms.client"
import { TimeClockExceptionLamCorrection } from "./tci-exception-lam-correction.client"
import {
  TimeClockDeviceEditDialog,
  TimeClockDeviceRevokeButton,
  type TimeClockDeviceFormSeed,
} from "./tci-device-forms.client"

type TciExceptionTrailingContext = {
  canDecide: boolean
  canCorrectAttendance: boolean
  rows: readonly {
    id: string
    state: string
    resolvedEventId: string | null
    occurredAtIso: string
    eventType: string
  }[]
}

export function TciExceptionTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const ctx = context as TciExceptionTrailingContext | undefined
  const match = ctx?.rows.find((entry) => entry.id === row.id)
  const trailingAction = row.trailingAction
  if (!ctx || !match) {
    return null
  }

  const showDecide =
    ctx.canDecide &&
    match.state === "submitted" &&
    isListSurfaceTrailingActionRenderable(trailingAction)

  const showCorrection =
    ctx.canCorrectAttendance &&
    match.state === "approved" &&
    match.resolvedEventId != null

  if (!showDecide && !showCorrection) {
    return null
  }

  if (
    showCorrection &&
    match.resolvedEventId &&
    isListSurfaceTrailingActionRenderable(trailingAction)
  ) {
    return (
      <GovernedTrailingActionSlot trailingAction={trailingAction}>
        <TimeClockExceptionLamCorrection
          resolvedEventId={match.resolvedEventId}
          occurredAtIso={match.occurredAtIso}
          eventType={match.eventType}
        />
      </GovernedTrailingActionSlot>
    )
  }

  if (showDecide) {
    return (
      <GovernedTrailingActionSlot trailingAction={trailingAction}>
        <TimeClockExceptionDecisionForms exceptionId={match.id} />
      </GovernedTrailingActionSlot>
    )
  }

  return null
}

type TciDeviceTrailingContext = {
  canManage: boolean
  devices: readonly (TimeClockDeviceFormSeed & { registryState: string })[]
}

type TciCorrectionWorkflowTrailingContext = {
  canDecide: boolean
  canCorrectAttendance: boolean
  rows: readonly {
    id: string
    workflowStep: string
    exceptionId: string | null
    resolvedEventId: string | null
    anchorEventId: string | null
    anchorOccurredAtIso: string | null
    anchorEventType: string | null
  }[]
}

export function TciCorrectionWorkflowTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const ctx = context as TciCorrectionWorkflowTrailingContext | undefined
  const match = ctx?.rows.find((entry) => entry.id === row.id)
  if (!ctx || !match) {
    return null
  }

  const trailingAction = row.trailingAction
  const showDecide =
    ctx.canDecide &&
    match.workflowStep === "needs_decision" &&
    match.exceptionId != null &&
    isListSurfaceTrailingActionRenderable(trailingAction)

  const anchorId = match.resolvedEventId ?? match.anchorEventId
  const showCorrect =
    ctx.canCorrectAttendance &&
    anchorId != null &&
    match.anchorOccurredAtIso != null &&
    (match.workflowStep === "needs_lam_correction" ||
      match.workflowStep === "lam_snapshot_correct")

  if (!showDecide && !showCorrect) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {showDecide && match.exceptionId ? (
        <GovernedTrailingActionSlot trailingAction={trailingAction}>
          <TimeClockExceptionDecisionForms exceptionId={match.exceptionId} />
        </GovernedTrailingActionSlot>
      ) : null}
      {showCorrect &&
      anchorId &&
      match.anchorOccurredAtIso &&
      isListSurfaceTrailingActionRenderable(trailingAction) ? (
        <GovernedTrailingActionSlot trailingAction={trailingAction}>
          <TimeClockExceptionLamCorrection
            resolvedEventId={anchorId}
            occurredAtIso={match.anchorOccurredAtIso}
            eventType={match.anchorEventType ?? "clock_in"}
          />
        </GovernedTrailingActionSlot>
      ) : null}
    </div>
  )
}

export function TciDeviceTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const ctx = context as TciDeviceTrailingContext | undefined
  const device = ctx?.devices.find((entry) => entry.id === row.id)
  const trailingAction = row.trailingAction
  if (
    !ctx ||
    !device ||
    !ctx.canManage ||
    device.registryState === "revoked" ||
    !isListSurfaceTrailingActionRenderable(trailingAction)
  ) {
    return null
  }
  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <TimeClockDeviceEditDialog device={device} />
        <TimeClockDeviceRevokeButton deviceId={device.id} />
      </div>
    </GovernedTrailingActionSlot>
  )
}
