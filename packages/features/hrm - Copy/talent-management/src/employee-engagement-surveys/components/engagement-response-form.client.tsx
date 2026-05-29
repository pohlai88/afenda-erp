"use client"

import { useActionState } from "react"
import { useTranslations } from "next-intl"

import { Button } from "@afenda/ui/button"
import { Checkbox } from "@afenda/ui/checkbox"
import { Field, FieldLabel } from "@afenda/ui/field"
import { Input } from "@afenda/ui/input"
import { Textarea } from "@afenda/ui/textarea"

import { engagementResponseFormAction } from "../actions/engagement-response.actions"
import { parseEngagementQuestionConfig } from "../schemas/engagement-question-config.shared"
import type { EngagementRespondPageData } from "../schemas/engagement-respond.shared"

import { EngagementFormFeedback } from "./engagement-form-feedback.client"

function EngagementQuestionField({
  question,
  defaultValue,
}: {
  question: EngagementRespondPageData["questions"][number]
  defaultValue: unknown
}) {
  const fieldName = `answer_${question.id}`
  const typeHidden = (
    <input
      type="hidden"
      name={`type_${question.id}`}
      value={question.questionType}
    />
  )
  const config = parseEngagementQuestionConfig(question.config)
  const choices = config?.choices ?? []

  switch (question.questionType) {
    case "rating":
      return (
        <Field>
          {typeHidden}
          <FieldLabel htmlFor={fieldName}>{question.prompt}</FieldLabel>
          <Input
            id={fieldName}
            name={fieldName}
            type="number"
            min={1}
            max={10}
            defaultValue={
              typeof defaultValue === "number" ? String(defaultValue) : "5"
            }
            required
          />
        </Field>
      )
    case "yes_no":
      return (
        <Field>
          {typeHidden}
          <FieldLabel htmlFor={fieldName}>{question.prompt}</FieldLabel>
          <select
            id={fieldName}
            name={fieldName}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
            defaultValue={
              defaultValue === true ? "yes" : defaultValue === false ? "no" : ""
            }
            required
          >
            <option value="" disabled>
              Select…
            </option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </Field>
      )
    case "single_choice":
      return (
        <Field>
          {typeHidden}
          <FieldLabel htmlFor={fieldName}>{question.prompt}</FieldLabel>
          <select
            id={fieldName}
            name={fieldName}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
            defaultValue={typeof defaultValue === "string" ? defaultValue : ""}
            required
          >
            <option value="" disabled>
              Select…
            </option>
            {choices.map((choice) => (
              <option key={choice} value={choice}>
                {choice}
              </option>
            ))}
          </select>
        </Field>
      )
    case "multi_choice":
      return (
        <Field>
          {typeHidden}
          <FieldLabel>{question.prompt}</FieldLabel>
          <div className="flex flex-col gap-2">
            {choices.map((choice) => {
              const selected =
                Array.isArray(defaultValue) && defaultValue.includes(choice)
              return (
                <label key={choice} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    name={fieldName}
                    value={choice}
                    defaultChecked={selected}
                  />
                  <span>{choice}</span>
                </label>
              )
            })}
          </div>
        </Field>
      )
    case "open_text":
    case "comment":
      return (
        <Field>
          {typeHidden}
          <FieldLabel htmlFor={fieldName}>{question.prompt}</FieldLabel>
          <Textarea
            id={fieldName}
            name={fieldName}
            rows={question.questionType === "comment" ? 2 : 4}
            defaultValue={typeof defaultValue === "string" ? defaultValue : ""}
            required={question.questionType === "open_text"}
          />
        </Field>
      )
    default:
      return null
  }
}

export function EngagementResponseForm({
  page,
  readOnly,
}: {
  page: EngagementRespondPageData
  readOnly: boolean
}) {
  const t = useTranslations("Erp.Hrm.employeeEngagement.respond")
  const [state, action, pending] = useActionState(
    engagementResponseFormAction,
    { ok: false, errors: {} }
  )

  if (
    page.invitationState === "submitted" ||
    page.responseState === "submitted"
  ) {
    return (
      <p className="text-sm text-muted-foreground">{t("alreadySubmitted")}</p>
    )
  }

  if (readOnly || !page.windowOpen) {
    return <p className="text-sm text-muted-foreground">{t("windowClosed")}</p>
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="invitationId" value={page.invitationId} />
      <div className="flex flex-col gap-4">
        {page.questions.map((question) => (
          <EngagementQuestionField
            key={question.id}
            question={question}
            defaultValue={page.answersByQuestionId[question.id]}
          />
        ))}
      </div>
      <EngagementFormFeedback state={state} savedLabel={t("savedSuccess")} />
      <div className="flex flex-wrap gap-2">
        {page.allowDraftResponses ? (
          <Button
            type="submit"
            name="intent"
            value="draft"
            variant="outline"
            disabled={pending}
          >
            {t("saveDraft")}
          </Button>
        ) : null}
        <Button type="submit" name="intent" value="submit" disabled={pending}>
          {t("submitResponse")}
        </Button>
      </div>
    </form>
  )
}
