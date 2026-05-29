"use client"

import {
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
} from "@afenda/governed-surface/client"
import type { GovernedListTrailingCellProps } from "@afenda/governed-surface/client"

import type { BenefitEnrollmentListRow } from "../data/benefit-model.shared"
import { BenefitEnrollmentRowActions } from "./benefit-enrollment-table"

type BenefitEnrollmentTrailingContext = {
  enrollments: readonly Pick<
    BenefitEnrollmentListRow,
    "enrollmentId" | "state"
  >[]
}

export function BenefitEnrollmentTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const enrollments = (context as BenefitEnrollmentTrailingContext | undefined)
    ?.enrollments
  const enrollment = enrollments?.find((entry) => entry.enrollmentId === row.id)
  const trailingAction = row.trailingAction
  if (!enrollment || !isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null
  }
  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <BenefitEnrollmentRowActions
        row={enrollment as BenefitEnrollmentListRow}
      />
    </GovernedTrailingActionSlot>
  )
}
