"use client"

import { useActionState } from "react"
import { useTranslations } from "next-intl"

import { Button } from "@afenda/ui/button"

import {
  closeEngagementSurveyAction,
  publishEngagementSurveyAction,
  resendEngagementInvitationAction,
} from "../actions/engagement-distribution.actions"
import { EngagementFormFeedback } from "./engagement-form-feedback.client"

export function PublishEngagementSurveyForm({
  surveyId,
  canManage,
  surveyState,
}: {
  surveyId: string
  canManage: boolean
  surveyState: string
}) {
  const t = useTranslations("Erp.Hrm.employeeEngagement.distribution")
  const [state, action, pending] = useActionState(
    publishEngagementSurveyAction,
    undefined
  )

  if (!canManage || surveyState !== "scheduled") return null

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="surveyId" value={surveyId} />
      <p className="text-sm text-muted-foreground">{t("publishHint")}</p>
      <EngagementFormFeedback state={state} />
      <Button type="submit" disabled={pending}>
        {t("publishSurvey")}
      </Button>
    </form>
  )
}

export function CloseEngagementSurveyForm({
  surveyId,
  canManage,
  surveyState,
}: {
  surveyId: string
  canManage: boolean
  surveyState: string
}) {
  const t = useTranslations("Erp.Hrm.employeeEngagement.distribution")
  const [state, action, pending] = useActionState(
    closeEngagementSurveyAction,
    undefined
  )

  if (!canManage || surveyState !== "published") return null

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="surveyId" value={surveyId} />
      <p className="text-sm text-muted-foreground">{t("closeHint")}</p>
      <EngagementFormFeedback state={state} />
      <Button type="submit" variant="outline" disabled={pending}>
        {t("closeSurvey")}
      </Button>
    </form>
  )
}

export function ResendEngagementInvitationForm({
  invitationId,
  disabled,
  disabledReason,
}: {
  invitationId: string
  disabled: boolean
  disabledReason?: string
}) {
  const t = useTranslations("Erp.Hrm.employeeEngagement.distribution")
  const [state, action, pending] = useActionState(
    resendEngagementInvitationAction,
    undefined
  )

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="invitationId" value={invitationId} />
      <EngagementFormFeedback state={state} />
      <Button
        type="submit"
        variant="outline"
        size="sm"
        disabled={disabled || pending}
        title={disabled ? disabledReason : undefined}
      >
        {t("resendInvitation")}
      </Button>
    </form>
  )
}
