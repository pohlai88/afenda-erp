"use client"

import { useActionState } from "react"
import { useTranslations } from "next-intl"
import { Loader2 } from "lucide-react"

import { Button } from "@afenda/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@afenda/ui/dialog"
import { Field, FieldError, FieldLabel } from "@afenda/ui/field"
import { Textarea } from "@afenda/ui/textarea"

import { createSuccessionNominationAction } from "../actions/succession-nomination.actions"
import {
  HRM_SUCCESSION_READINESS_LEVELS,
  HRM_SUCCESSION_SUCCESSOR_TYPES,
} from "../schemas/succession-workflow-state.shared"
import type { SuccessionMutationFormState } from "../schemas/succession.schema"
import type {
  SuccessionCriticalRoleChoiceRow,
  SuccessionEmployeeChoiceRow,
} from "../data/succession.types.shared"

const SELECT_CLASS =
  "h-9 w-full rounded border border-border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"

type SuccessionNominationFormDialogProps = {
  roleChoices: readonly SuccessionCriticalRoleChoiceRow[]
  employeeChoices: readonly SuccessionEmployeeChoiceRow[]
}

export function SuccessionNominationFormDialog({
  roleChoices,
  employeeChoices,
}: SuccessionNominationFormDialogProps) {
  const t = useTranslations("Erp.Hrm.successionPlanning")
  const [state, formAction, pending] = useActionState<
    SuccessionMutationFormState | undefined,
    FormData
  >(createSuccessionNominationAction, undefined)

  const error = state && !state.ok ? state.errors : null

  if (roleChoices.length === 0 || employeeChoices.length === 0) {
    return null
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          {t("createNomination")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createNominationTitle")}</DialogTitle>
          <DialogDescription>{t("createNominationDescription")}</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="succession-nomination-role">{t("fieldCriticalRole")}</FieldLabel>
            <select
              id="succession-nomination-role"
              name="criticalRoleId"
              required
              className={SELECT_CLASS}
              defaultValue={roleChoices[0]?.id}
            >
              {roleChoices.map((choice) => (
                <option key={choice.id} value={choice.id}>
                  {choice.label}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="succession-nomination-candidate">{t("fieldCandidate")}</FieldLabel>
            <select
              id="succession-nomination-candidate"
              name="candidateEmployeeId"
              required
              className={SELECT_CLASS}
              defaultValue={employeeChoices[0]?.id}
            >
              {employeeChoices.map((choice) => (
                <option key={choice.id} value={choice.id}>
                  {choice.label}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="succession-nomination-type">{t("fieldSuccessorType")}</FieldLabel>
            <select
              id="succession-nomination-type"
              name="successorType"
              defaultValue="secondary"
              className={SELECT_CLASS}
            >
              {HRM_SUCCESSION_SUCCESSOR_TYPES.map((value) => (
                <option key={value} value={value}>
                  {t(`successorTypeLabels.${value}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="succession-nomination-readiness">
              {t("fieldReadinessLevel")}
            </FieldLabel>
            <select
              id="succession-nomination-readiness"
              name="readinessLevel"
              defaultValue="future_potential"
              className={SELECT_CLASS}
            >
              {HRM_SUCCESSION_READINESS_LEVELS.map((value) => (
                <option key={value} value={value}>
                  {t(`readinessLevelLabels.${value}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="succession-nomination-reason">{t("fieldNominationReason")}</FieldLabel>
            <Textarea id="succession-nomination-reason" name="nominationReason" rows={3} />
          </Field>
          {error?.form ? <FieldError>{error.form}</FieldError> : null}
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            {t("saveNomination")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
