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

import { createGpgAdjustmentReferenceAction } from "../actions/gpg-assignment.actions"
import { HRM_GPG_ADJUSTMENT_TYPES } from "../schemas/gpg-workflow-state.shared"
import type {
  GpgClassificationChoiceRow,
  GpgEmployeeChoiceRow,
} from "../data/gpg.types.shared"
import type { CreateGpgAdjustmentReferenceFormState } from "@afenda/feature-hrm-core/shared"

const SELECT_CLASS =
  "h-9 w-full rounded border border-border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"

export function GpgAdjustmentReferenceCreateDialog({
  employees,
  localityRules,
}: {
  employees: readonly GpgEmployeeChoiceRow[]
  localityRules: readonly GpgClassificationChoiceRow[]
}) {
  const t = useTranslations("Erp.Hrm.governmentPayGrades")
  const [state, formAction, pending] = useActionState<
    CreateGpgAdjustmentReferenceFormState | undefined,
    FormData
  >(createGpgAdjustmentReferenceAction, undefined)

  const error = state && !state.ok ? state.errors : null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          {t("createAdjustmentRef")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createAdjustmentRefTitle")}</DialogTitle>
          <DialogDescription>
            {t("createAdjustmentRefDescription")}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="gpg-ar-emp">{t("fieldEmployee")}</FieldLabel>
            <select
              id="gpg-ar-emp"
              name="employeeId"
              className={SELECT_CLASS}
              required
              disabled={pending || employees.length === 0}
            >
              {employees.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.label}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="gpg-ar-type">
              {t("fieldAdjustmentType")}
            </FieldLabel>
            <select
              id="gpg-ar-type"
              name="adjustmentType"
              className={SELECT_CLASS}
              disabled={pending}
              defaultValue="regional"
            >
              {HRM_GPG_ADJUSTMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`adjustmentTypeLabels.${type}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="gpg-ar-loc">
              {t("fieldLocalityRuleOptional")}
            </FieldLabel>
            <select
              id="gpg-ar-loc"
              name="localityRuleId"
              className={SELECT_CLASS}
              disabled={pending}
              defaultValue=""
            >
              <option value="">{t("optionalNone")}</option>
              {localityRules.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.label}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="gpg-ar-pct">
              {t("fieldAdjustmentPercent")}
            </FieldLabel>
            <Input id="gpg-ar-pct" name="percent" disabled={pending} />
          </Field>
          <Field>
            <FieldLabel htmlFor="gpg-ar-amt">{t("colAmount")}</FieldLabel>
            <Input id="gpg-ar-amt" name="amount" disabled={pending} />
          </Field>
          <Field>
            <FieldLabel htmlFor="gpg-ar-effective">
              {t("fieldEffectiveDate")}
            </FieldLabel>
            <Input
              id="gpg-ar-effective"
              name="effectiveDate"
              type="date"
              required
              disabled={pending}
            />
          </Field>
          {error?.form ? <FieldError>{error.form}</FieldError> : null}
          <Button type="submit" disabled={pending || employees.length === 0}>
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                {t("saving")}
              </>
            ) : (
              t("save")
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
