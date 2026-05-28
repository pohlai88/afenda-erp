"use client"

import {
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
} from "@afenda/governed-surface/client"
import type { GovernedListTrailingCellProps } from "@afenda/governed-surface/client"

import type { EngagementImprovementActionListRow } from "../schemas/engagement-query.shared"
import { ResendEngagementInvitationForm } from "./engagement-distribution-forms.client"
import {
  CompleteEngagementImprovementActionForm,
  StartEngagementImprovementActionForm,
} from "./engagement-improvement-forms.client"

type EngagementCompletionTrailingContext = {
  invitations: readonly { invitationId: string }[]
}

export function EngagementCompletionTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const ctx = context as EngagementCompletionTrailingContext | undefined
  const invitation = ctx?.invitations.find(
    (entry) => entry.invitationId === row.id
  )
  const trailingAction = row.trailingAction
  if (
    !ctx ||
    !invitation ||
    !isListSurfaceTrailingActionRenderable(trailingAction)
  ) {
    return null
  }
  const disabled = trailingAction.state === "disabled"
  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <ResendEngagementInvitationForm
        invitationId={invitation.invitationId}
        disabled={disabled}
        disabledReason={trailingAction.disabledReason}
      />
    </GovernedTrailingActionSlot>
  )
}

type EngagementImprovementTrailingContext = {
  surveyId: string
  rows: readonly EngagementImprovementActionListRow[]
}

export function EngagementImprovementTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const ctx = context as EngagementImprovementTrailingContext | undefined
  const actionRow = ctx?.rows.find((entry) => entry.id === row.id)
  const trailingAction = row.trailingAction
  if (
    !ctx ||
    !actionRow ||
    !isListSurfaceTrailingActionRenderable(trailingAction)
  ) {
    return null
  }
  const disabled = trailingAction.state === "disabled"
  const descriptorId = trailingAction.descriptor?.id
  if (!descriptorId) {
    return null
  }
  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      {descriptorId === "hrm.employee_engagement.improvement_action.start" ? (
        <StartEngagementImprovementActionForm
          actionId={actionRow.id}
          surveyId={ctx.surveyId}
          disabled={disabled}
          disabledReason={trailingAction.disabledReason}
        />
      ) : (
        <CompleteEngagementImprovementActionForm
          actionId={actionRow.id}
          surveyId={ctx.surveyId}
          disabled={disabled}
          disabledReason={trailingAction.disabledReason}
        />
      )}
    </GovernedTrailingActionSlot>
  )
}
