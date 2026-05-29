"use client"

import {
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
} from "@afenda/governed-surface/client"
import type { GovernedListTrailingCellProps } from "@afenda/governed-surface/client"

import type { FhcVerificationQueueRow } from "../data/fhc-verification.server"
import { FhcVerificationTrailingActions } from "./fhc-verification-trailing.client"

type FhcVerificationTrailingContext = {
  rows: readonly Pick<
    FhcVerificationQueueRow,
    | "id"
    | "employeeId"
    | "employeeLabel"
    | "subjectKind"
    | "subjectId"
    | "obligationId"
    | "verificationState"
  >[]
}

export function FhcVerificationTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const rows = (context as FhcVerificationTrailingContext | undefined)?.rows
  const match = rows?.find((entry) => entry.id === row.id)
  const trailingAction = row.trailingAction
  if (!match || !isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null
  }
  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <FhcVerificationTrailingActions row={match as FhcVerificationQueueRow} />
    </GovernedTrailingActionSlot>
  )
}
