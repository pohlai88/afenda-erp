"use client"

import { useActionState } from "react"
import { useTranslations } from "next-intl"

import { Button } from "@afenda/ui/button"
import { Input } from "@afenda/ui/input"
import { Label } from "@afenda/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@afenda/ui/select"

import {
  completeEngagementImprovementActionAction,
  createEngagementImprovementActionAction,
  updateEngagementImprovementActionAction,
} from "../actions/engagement-improvement.actions"
import { HRM_ENGAGEMENT_CATEGORIES } from "../schemas/engagement-workflow.shared"
import { HRM_ENGAGEMENT_IMPROVEMENT_PRIORITIES } from "../schemas/engagement-improvement.shared"
import type { EngagementImprovementOwnerOption } from "../schemas/engagement-query.shared"

import { EngagementFormFeedback } from "./engagement-form-feedback.client"

export function CreateEngagementImprovementActionForm({
  surveyId,
  canManage,
  ownerOptions,
}: {
  surveyId: string
  canManage: boolean
  ownerOptions: readonly EngagementImprovementOwnerOption[]
}) {
  const t = useTranslations(
    "Erp.Hrm.employeeEngagement.distribution.improvement"
  )
  const [state, action, pending] = useActionState(
    createEngagementImprovementActionAction,
    undefined
  )

  if (!canManage) return null

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="surveyId" value={surveyId} />
      <div className="flex flex-col gap-2">
        <Label htmlFor="improvement-title">{t("fieldTitle")}</Label>
        <Input
          id="improvement-title"
          name="title"
          required
          maxLength={200}
          placeholder={t("fieldTitlePlaceholder")}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="improvement-owner">{t("fieldOwner")}</Label>
          <Select name="ownerEmployeeId">
            <SelectTrigger id="improvement-owner">
              <SelectValue placeholder={t("fieldOwnerPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {ownerOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="improvement-due">{t("fieldDueDate")}</Label>
          <Input id="improvement-due" name="dueDate" type="date" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="improvement-priority">{t("fieldPriority")}</Label>
          <Select name="priority">
            <SelectTrigger id="improvement-priority">
              <SelectValue placeholder={t("fieldPriorityPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {HRM_ENGAGEMENT_IMPROVEMENT_PRIORITIES.map((priority) => (
                <SelectItem key={priority} value={priority}>
                  {t(`priorityLabels.${priority}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="improvement-category">{t("fieldCategory")}</Label>
          <Select name="category">
            <SelectTrigger id="improvement-category">
              <SelectValue placeholder={t("fieldCategoryPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {HRM_ENGAGEMENT_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {t(`categoryLabels.${category}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <EngagementFormFeedback state={state} />
      <Button type="submit" disabled={pending}>
        {t("createAction")}
      </Button>
    </form>
  )
}

export function StartEngagementImprovementActionForm({
  actionId,
  surveyId,
  disabled,
  disabledReason,
}: {
  actionId: string
  surveyId: string
  disabled?: boolean
  disabledReason?: string
}) {
  const t = useTranslations(
    "Erp.Hrm.employeeEngagement.distribution.improvement"
  )
  const [state, formAction, pending] = useActionState(
    updateEngagementImprovementActionAction,
    undefined
  )

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="actionId" value={actionId} />
      <input type="hidden" name="surveyId" value={surveyId} />
      <input type="hidden" name="nextStatus" value="in_progress" />
      <EngagementFormFeedback state={state} />
      <Button
        type="submit"
        size="sm"
        variant="secondary"
        disabled={disabled || pending}
        title={disabled ? disabledReason : undefined}
      >
        {t("startProgress")}
      </Button>
    </form>
  )
}

export function CompleteEngagementImprovementActionForm({
  actionId,
  surveyId,
  disabled,
  disabledReason,
}: {
  actionId: string
  surveyId: string
  disabled?: boolean
  disabledReason?: string
}) {
  const t = useTranslations(
    "Erp.Hrm.employeeEngagement.distribution.improvement"
  )
  const [state, formAction, pending] = useActionState(
    completeEngagementImprovementActionAction,
    undefined
  )

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="actionId" value={actionId} />
      <input type="hidden" name="surveyId" value={surveyId} />
      <EngagementFormFeedback state={state} />
      <Button
        type="submit"
        size="sm"
        disabled={disabled || pending}
        title={disabled ? disabledReason : undefined}
      >
        {t("completeAction")}
      </Button>
    </form>
  )
}
