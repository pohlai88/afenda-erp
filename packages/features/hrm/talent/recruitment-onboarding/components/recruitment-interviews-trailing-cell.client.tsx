"use client"

import {
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
} from "@afenda/governed-surface/client"
import type { GovernedListTrailingCellProps } from "@afenda/governed-surface/client"

import type { HrmInterviewOutcome } from "../schemas/recruitment.schema"
import { RecruitmentInterviewTrailing } from "./recruitment-interview-trailing.client"

type RecruitmentInterviewsTrailingContext = {
  orgSlug: string
  outcomes: readonly HrmInterviewOutcome[]
  fieldOutcome: string
  fieldFeedback: string
  submitLabel: string
  interviews: readonly { id: string }[]
}

export function RecruitmentInterviewsTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const ctx = context as RecruitmentInterviewsTrailingContext | undefined
  const interview = ctx?.interviews.find((entry) => entry.id === row.id)
  const trailingAction = row.trailingAction
  if (
    !ctx ||
    !interview ||
    !isListSurfaceTrailingActionRenderable(trailingAction)
  ) {
    return null
  }
  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <RecruitmentInterviewTrailing
        orgSlug={ctx.orgSlug}
        interviewId={interview.id}
        outcomes={ctx.outcomes}
        fieldOutcome={ctx.fieldOutcome}
        fieldFeedback={ctx.fieldFeedback}
        submitLabel={ctx.submitLabel}
      />
    </GovernedTrailingActionSlot>
  )
}
