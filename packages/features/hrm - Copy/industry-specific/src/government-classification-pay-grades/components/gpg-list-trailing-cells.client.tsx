"use client"

import {
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
} from "@afenda/governed-surface/client"
import type { GovernedListTrailingCellProps } from "@afenda/governed-surface/client"

import type { GpgStepEligibleRow } from "../data/gpg.types.shared"
import { GpgGradeMovementApplyTrailing } from "./gpg-grade-movement-apply-trailing.client"
import { GpgReclassificationDecideTrailing } from "./gpg-reclassification-decide-trailing.client"
import { GpgStepEligibleQueueTrailing } from "./gpg-step-eligible-queue-trailing.client"
import { GpgStepIncreaseEventTrailing } from "./gpg-step-increase-event-trailing.client"

type GpgStepEligibleTrailingContext = {
  eligible: readonly GpgStepEligibleRow[]
}

export function GpgStepEligibleTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const eligible = (context as GpgStepEligibleTrailingContext | undefined)
    ?.eligible
  const match = eligible?.find((entry) => entry.assignmentId === row.id) as
    | GpgStepEligibleRow
    | undefined
  const trailingAction = row.trailingAction
  if (!match || !isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null
  }
  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <GpgStepEligibleQueueTrailing
        row={match}
        disabled={trailingAction.state === "disabled"}
      />
    </GovernedTrailingActionSlot>
  )
}

type GpgGradeMovementTrailingContext = {
  movements: readonly { id: string; state: string }[]
}

export function GpgGradeMovementTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const movements = (context as GpgGradeMovementTrailingContext | undefined)
    ?.movements
  const movement = movements?.find((entry) => entry.id === row.id)
  const trailingAction = row.trailingAction
  if (
    !movement ||
    movement.state !== "draft" ||
    !isListSurfaceTrailingActionRenderable(trailingAction)
  ) {
    return null
  }
  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <GpgGradeMovementApplyTrailing
        movementId={movement.id}
        disabled={trailingAction.state === "disabled"}
      />
    </GovernedTrailingActionSlot>
  )
}

type GpgReclassificationTrailingContext = {
  requests: readonly { id: string; state: string }[]
}

export function GpgReclassificationTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const requests = (context as GpgReclassificationTrailingContext | undefined)
    ?.requests
  const request = requests?.find((entry) => entry.id === row.id)
  const trailingAction = row.trailingAction
  if (
    !request ||
    request.state !== "submitted" ||
    !isListSurfaceTrailingActionRenderable(trailingAction)
  ) {
    return null
  }
  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <GpgReclassificationDecideTrailing
        requestId={request.id}
        disabled={trailingAction.state === "disabled"}
      />
    </GovernedTrailingActionSlot>
  )
}

type GpgStepEventTrailingContext = {
  events: readonly { id: string; state: string }[]
}

export function GpgStepEventTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const events = (context as GpgStepEventTrailingContext | undefined)?.events
  const event = events?.find((entry) => entry.id === row.id)
  const trailingAction = row.trailingAction
  if (
    !event ||
    event.state !== "pending" ||
    !isListSurfaceTrailingActionRenderable(trailingAction)
  ) {
    return null
  }
  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <GpgStepIncreaseEventTrailing
        eventId={event.id}
        disabled={trailingAction.state === "disabled"}
      />
    </GovernedTrailingActionSlot>
  )
}
