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
import { Input } from "@afenda/ui/input"

import { createSuccessionCriticalRoleAction } from "../actions/succession-critical-role.actions"
import {
  HRM_SUCCESSION_BUSINESS_IMPACTS,
  HRM_SUCCESSION_VACANCY_RISKS,
} from "../schemas/succession-workflow-state.shared"
import type { SuccessionMutationFormState } from "../schemas/succession.schema"

const SELECT_CLASS =
  "h-9 w-full rounded border border-border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"

export function SuccessionCriticalRoleFormDialog() {
  const t = useTranslations("Erp.Hrm.successionPlanning")
  const [state, formAction, pending] = useActionState<
    SuccessionMutationFormState | undefined,
    FormData
  >(createSuccessionCriticalRoleAction, undefined)

  const error = state && !state.ok ? state.errors : null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          {t("createCriticalRole")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createCriticalRoleTitle")}</DialogTitle>
          <DialogDescription>{t("createCriticalRoleDescription")}</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="succession-role-code">{t("fieldCode")}</FieldLabel>
            <Input id="succession-role-code" name="code" required />
          </Field>
          <Field>
            <FieldLabel htmlFor="succession-role-title">{t("fieldTitle")}</FieldLabel>
            <Input id="succession-role-title" name="title" required />
          </Field>
          <Field>
            <FieldLabel htmlFor="succession-role-impact">{t("fieldBusinessImpact")}</FieldLabel>
            <select
              id="succession-role-impact"
              name="businessImpact"
              defaultValue="medium"
              className={SELECT_CLASS}
            >
              {HRM_SUCCESSION_BUSINESS_IMPACTS.map((value) => (
                <option key={value} value={value}>
                  {t(`businessImpactLabels.${value}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="succession-role-vacancy">{t("fieldVacancyRisk")}</FieldLabel>
            <select
              id="succession-role-vacancy"
              name="vacancyRisk"
              defaultValue="medium"
              className={SELECT_CLASS}
            >
              {HRM_SUCCESSION_VACANCY_RISKS.map((value) => (
                <option key={value} value={value}>
                  {t(`vacancyRiskLabels.${value}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="succession-role-leadership">
              {t("fieldLeadershipLevel")}
            </FieldLabel>
            <Input
              id="succession-role-leadership"
              name="leadershipLevel"
              defaultValue="individual"
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="succession-role-difficulty">
              {t("fieldReplacementDifficulty")}
            </FieldLabel>
            <Input
              id="succession-role-difficulty"
              name="replacementDifficulty"
              defaultValue="medium"
              required
            />
          </Field>
          {error?.form ? <FieldError>{error.form}</FieldError> : null}
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            {t("saveCriticalRole")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
