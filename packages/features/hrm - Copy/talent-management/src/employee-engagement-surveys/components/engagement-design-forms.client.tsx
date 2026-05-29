"use client"

import { useActionState, useId, useState } from "react"
import { useTranslations } from "next-intl"

import { Button } from "@afenda/ui/button"
import { Field, FieldError, FieldLabel } from "@afenda/ui/field"
import { Input } from "@afenda/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@afenda/ui/select"
import { Textarea } from "@afenda/ui/textarea"

import {
  addEngagementTemplateQuestionAction,
  archiveEngagementTemplateAction,
  cloneEngagementTemplateAction,
  createEngagementSurveyDraftAction,
  createEngagementTemplateAction,
  deleteEngagementSurveyDraftAction,
  updateEngagementSurveyDraftAction,
  updateEngagementTemplateAction,
} from "../actions/engagement-design.actions"
import type { EngagementDesignFormState } from "../schemas/engagement-form-state.shared"
import {
  HRM_ENGAGEMENT_CATEGORIES,
  HRM_ENGAGEMENT_QUESTION_TYPES,
  HRM_ENGAGEMENT_SURVEY_TYPES,
  HRM_ENGAGEMENT_TEMPLATE_STATES,
} from "../schemas/engagement-workflow.shared"
import type {
  EngagementDraftSurveyListRow,
  EngagementTemplateListRow,
  EngagementTemplateOption,
} from "../schemas/engagement-query.shared"

import { EngagementFormFeedback } from "./engagement-form-feedback.client"

export function CreateEngagementTemplateForm() {
  const t = useTranslations("Erp.Hrm.employeeEngagement.tables")
  const [state, formAction, pending] = useActionState<
    EngagementDesignFormState | undefined,
    FormData
  >(createEngagementTemplateAction, undefined)
  const codeId = useId()
  const nameId = useId()
  const descId = useId()
  const errors = state && !state.ok ? state.errors : null

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor={codeId}>{t("fieldCode")}</FieldLabel>
          <Input
            id={codeId}
            name="code"
            required
            maxLength={64}
            disabled={pending}
          />
          {errors?.code ? <FieldError>{errors.code}</FieldError> : null}
        </Field>
        <Field>
          <FieldLabel htmlFor={nameId}>{t("fieldName")}</FieldLabel>
          <Input
            id={nameId}
            name="name"
            required
            maxLength={200}
            disabled={pending}
          />
          {errors?.name ? <FieldError>{errors.name}</FieldError> : null}
        </Field>
      </div>
      <Field>
        <FieldLabel htmlFor={descId}>{t("fieldDescription")}</FieldLabel>
        <Textarea
          id={descId}
          name="description"
          rows={2}
          maxLength={2000}
          disabled={pending}
        />
      </Field>
      <EngagementFormFeedback state={state} />
      <Button type="submit" disabled={pending} size="sm">
        {t("createTemplateSubmit")}
      </Button>
    </form>
  )
}

export function UpdateEngagementTemplateForm({
  templates,
}: {
  templates: readonly EngagementTemplateListRow[]
}) {
  const t = useTranslations("Erp.Hrm.employeeEngagement.tables")
  const editable = templates.filter((row) => row.state !== "archived")
  const [state, formAction, pending] = useActionState<
    EngagementDesignFormState | undefined,
    FormData
  >(updateEngagementTemplateAction, undefined)

  if (editable.length === 0) return null

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <Field>
        <FieldLabel htmlFor="eng-update-tpl">{t("fieldTemplate")}</FieldLabel>
        <Select name="templateId" required disabled={pending}>
          <SelectTrigger id="eng-update-tpl">
            <SelectValue placeholder={t("selectTemplate")} />
          </SelectTrigger>
          <SelectContent>
            {editable.map((row) => (
              <SelectItem key={row.id} value={row.id}>
                {row.code} — {row.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field>
        <FieldLabel htmlFor="eng-update-name">{t("fieldName")}</FieldLabel>
        <Input
          id="eng-update-name"
          name="name"
          required
          maxLength={200}
          disabled={pending}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="eng-update-desc">
          {t("fieldDescription")}
        </FieldLabel>
        <Textarea
          id="eng-update-desc"
          name="description"
          rows={2}
          maxLength={2000}
          disabled={pending}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="eng-update-state">{t("colState")}</FieldLabel>
        <Select name="state" defaultValue="draft" required disabled={pending}>
          <SelectTrigger id="eng-update-state">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {HRM_ENGAGEMENT_TEMPLATE_STATES.filter((s) => s !== "archived").map(
              (stateValue) => (
                <SelectItem key={stateValue} value={stateValue}>
                  {t(`templateStateLabels.${stateValue}`)}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
      </Field>
      <EngagementFormFeedback state={state} />
      <Button type="submit" disabled={pending} size="sm" variant="secondary">
        {t("updateTemplateSubmit")}
      </Button>
    </form>
  )
}

export function ArchiveEngagementTemplateForm({
  templates,
}: {
  templates: readonly EngagementTemplateListRow[]
}) {
  const t = useTranslations("Erp.Hrm.employeeEngagement.tables")
  const editable = templates.filter((row) => row.state !== "archived")
  const [state, formAction, pending] = useActionState<
    EngagementDesignFormState | undefined,
    FormData
  >(archiveEngagementTemplateAction, undefined)

  if (editable.length === 0) return null

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <Field>
        <FieldLabel htmlFor="eng-archive-tpl">{t("fieldTemplate")}</FieldLabel>
        <Select name="templateId" required disabled={pending}>
          <SelectTrigger id="eng-archive-tpl">
            <SelectValue placeholder={t("selectTemplate")} />
          </SelectTrigger>
          <SelectContent>
            {editable.map((row) => (
              <SelectItem key={row.id} value={row.id}>
                {row.code} — {row.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <EngagementFormFeedback state={state} />
      <Button type="submit" disabled={pending} size="sm" variant="destructive">
        {t("archiveTemplateSubmit")}
      </Button>
    </form>
  )
}

export function CloneEngagementTemplateForm({
  templates,
}: {
  templates: readonly EngagementTemplateOption[]
}) {
  const t = useTranslations("Erp.Hrm.employeeEngagement.tables")
  const [state, formAction, pending] = useActionState<
    EngagementDesignFormState | undefined,
    FormData
  >(cloneEngagementTemplateAction, undefined)
  const errors = state && !state.ok ? state.errors : null

  if (templates.length === 0) return null

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <Field>
        <FieldLabel htmlFor="eng-clone-source">
          {t("fieldSourceTemplate")}
        </FieldLabel>
        <Select name="sourceTemplateId" required disabled={pending}>
          <SelectTrigger id="eng-clone-source">
            <SelectValue placeholder={t("selectTemplate")} />
          </SelectTrigger>
          <SelectContent>
            {templates.map((row) => (
              <SelectItem key={row.id} value={row.id}>
                {row.code} — {row.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <div className="grid gap-2 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="eng-clone-code">{t("fieldCode")}</FieldLabel>
          <Input
            id="eng-clone-code"
            name="code"
            required
            maxLength={64}
            disabled={pending}
          />
          {errors?.code ? <FieldError>{errors.code}</FieldError> : null}
        </Field>
        <Field>
          <FieldLabel htmlFor="eng-clone-name">{t("fieldName")}</FieldLabel>
          <Input
            id="eng-clone-name"
            name="name"
            required
            maxLength={200}
            disabled={pending}
          />
          {errors?.name ? <FieldError>{errors.name}</FieldError> : null}
        </Field>
      </div>
      <EngagementFormFeedback state={state} />
      <Button type="submit" disabled={pending} size="sm" variant="secondary">
        {t("cloneTemplateSubmit")}
      </Button>
    </form>
  )
}

export function AddEngagementTemplateQuestionForm({
  templates,
}: {
  templates: readonly EngagementTemplateOption[]
}) {
  const t = useTranslations("Erp.Hrm.employeeEngagement.tables")
  const [state, formAction, pending] = useActionState<
    EngagementDesignFormState | undefined,
    FormData
  >(addEngagementTemplateQuestionAction, undefined)
  const errors = state && !state.ok ? state.errors : null
  const [questionType, setQuestionType] =
    useState<(typeof HRM_ENGAGEMENT_QUESTION_TYPES)[number]>("rating")
  const showChoiceConfig =
    questionType === "single_choice" || questionType === "multi_choice"

  if (templates.length === 0) return null

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <Field>
        <FieldLabel htmlFor="eng-q-template">{t("fieldTemplate")}</FieldLabel>
        <Select name="templateId" required disabled={pending}>
          <SelectTrigger id="eng-q-template">
            <SelectValue placeholder={t("selectTemplate")} />
          </SelectTrigger>
          <SelectContent>
            {templates.map((row) => (
              <SelectItem key={row.id} value={row.id}>
                {row.code} — {row.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field>
        <FieldLabel htmlFor="eng-q-prompt">{t("fieldPrompt")}</FieldLabel>
        <Textarea
          id="eng-q-prompt"
          name="prompt"
          required
          rows={2}
          maxLength={2000}
          disabled={pending}
        />
        {errors?.prompt ? <FieldError>{errors.prompt}</FieldError> : null}
      </Field>
      <div className="grid gap-2 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="eng-q-type">{t("fieldQuestionType")}</FieldLabel>
          <Select
            name="questionType"
            defaultValue="rating"
            required
            disabled={pending}
            onValueChange={(value) =>
              setQuestionType(
                value as (typeof HRM_ENGAGEMENT_QUESTION_TYPES)[number]
              )
            }
          >
            <SelectTrigger id="eng-q-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {HRM_ENGAGEMENT_QUESTION_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {t(`questionTypeLabels.${type}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="eng-q-cat">{t("fieldCategory")}</FieldLabel>
          <Select
            name="category"
            defaultValue="culture"
            required
            disabled={pending}
          >
            <SelectTrigger id="eng-q-cat">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {HRM_ENGAGEMENT_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {t(`categoryLabels.${cat}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>
      {showChoiceConfig ? (
        <Field>
          <FieldLabel htmlFor="eng-q-choices">{t("fieldChoices")}</FieldLabel>
          <Textarea
            id="eng-q-choices"
            name="choices"
            rows={4}
            maxLength={4000}
            disabled={pending}
            placeholder={t("choicesPlaceholder")}
          />
          <p className="text-xs text-muted-foreground">{t("choicesHint")}</p>
        </Field>
      ) : null}
      <EngagementFormFeedback state={state} />
      <Button type="submit" disabled={pending} size="sm">
        {t("addQuestionSubmit")}
      </Button>
    </form>
  )
}

export function CreateEngagementSurveyDraftForm({
  templateOptions,
}: {
  templateOptions: readonly EngagementTemplateOption[]
}) {
  const t = useTranslations("Erp.Hrm.employeeEngagement.tables")
  const [state, formAction, pending] = useActionState<
    EngagementDesignFormState | undefined,
    FormData
  >(createEngagementSurveyDraftAction, undefined)
  const errors = state && !state.ok ? state.errors : null

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <Field>
        <FieldLabel htmlFor="eng-survey-title">
          {t("fieldSurveyTitle")}
        </FieldLabel>
        <Input
          id="eng-survey-title"
          name="title"
          required
          maxLength={200}
          disabled={pending}
        />
        {errors?.title ? <FieldError>{errors.title}</FieldError> : null}
      </Field>
      <div className="grid gap-2 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="eng-survey-type">
            {t("fieldSurveyType")}
          </FieldLabel>
          <Select
            name="surveyType"
            defaultValue="engagement"
            required
            disabled={pending}
          >
            <SelectTrigger id="eng-survey-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {HRM_ENGAGEMENT_SURVEY_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {t(`surveyTypeLabels.${type}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="eng-survey-template">
            {t("fieldTemplate")}
          </FieldLabel>
          <Select name="templateId" disabled={pending}>
            <SelectTrigger id="eng-survey-template">
              <SelectValue placeholder={t("templateOptional")} />
            </SelectTrigger>
            <SelectContent>
              {templateOptions.map((row) => (
                <SelectItem key={row.id} value={row.id}>
                  {row.code} — {row.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>
      <EngagementFormFeedback state={state} />
      <Button type="submit" disabled={pending} size="sm">
        {t("createSurveySubmit")}
      </Button>
    </form>
  )
}

export function UpdateEngagementSurveyDraftForm({
  draftSurveys,
}: {
  draftSurveys: readonly EngagementDraftSurveyListRow[]
}) {
  const t = useTranslations("Erp.Hrm.employeeEngagement.tables")
  const [state, formAction, pending] = useActionState<
    EngagementDesignFormState | undefined,
    FormData
  >(updateEngagementSurveyDraftAction, undefined)

  if (draftSurveys.length === 0) return null

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <Field>
        <FieldLabel htmlFor="eng-upd-survey">
          {t("fieldDraftSurvey")}
        </FieldLabel>
        <Select name="surveyId" required disabled={pending}>
          <SelectTrigger id="eng-upd-survey">
            <SelectValue placeholder={t("selectDraftSurvey")} />
          </SelectTrigger>
          <SelectContent>
            {draftSurveys.map((row) => (
              <SelectItem key={row.id} value={row.id}>
                {row.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field>
        <FieldLabel htmlFor="eng-upd-title">{t("fieldSurveyTitle")}</FieldLabel>
        <Input
          id="eng-upd-title"
          name="title"
          required
          maxLength={200}
          disabled={pending}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="eng-upd-type">{t("fieldSurveyType")}</FieldLabel>
        <Select
          name="surveyType"
          defaultValue="engagement"
          required
          disabled={pending}
        >
          <SelectTrigger id="eng-upd-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {HRM_ENGAGEMENT_SURVEY_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {t(`surveyTypeLabels.${type}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <EngagementFormFeedback state={state} />
      <Button type="submit" disabled={pending} size="sm" variant="secondary">
        {t("updateSurveySubmit")}
      </Button>
    </form>
  )
}

export function DeleteEngagementSurveyDraftForm({
  draftSurveys,
}: {
  draftSurveys: readonly EngagementDraftSurveyListRow[]
}) {
  const t = useTranslations("Erp.Hrm.employeeEngagement.tables")
  const [state, formAction, pending] = useActionState<
    EngagementDesignFormState | undefined,
    FormData
  >(deleteEngagementSurveyDraftAction, undefined)

  if (draftSurveys.length === 0) return null

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <Field>
        <FieldLabel htmlFor="eng-del-survey">
          {t("fieldDraftSurvey")}
        </FieldLabel>
        <Select name="surveyId" required disabled={pending}>
          <SelectTrigger id="eng-del-survey">
            <SelectValue placeholder={t("selectDraftSurvey")} />
          </SelectTrigger>
          <SelectContent>
            {draftSurveys.map((row) => (
              <SelectItem key={row.id} value={row.id}>
                {row.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <EngagementFormFeedback state={state} />
      <Button type="submit" disabled={pending} size="sm" variant="destructive">
        {t("deleteSurveySubmit")}
      </Button>
    </form>
  )
}
