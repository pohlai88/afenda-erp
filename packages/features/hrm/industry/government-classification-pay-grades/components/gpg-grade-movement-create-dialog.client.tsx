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

import { createGpgGradeMovementAction } from "../actions/gpg-movement.actions"
import type {
  GpgActiveAssignmentChoiceRow,
  GpgClassificationChoiceRow,
  GpgPayGradeChoiceRow,
  GpgSalaryTableVersionChoiceRow,
} from "../data/gpg.types.shared"
import type { CreateGpgGradeMovementFormState } from "../../../_core/shared"

const SELECT_CLASS =
  "h-9 w-full rounded border border-border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"

const WIZARD_MOVEMENT_TYPES = [
  "promotion",
  "reclassification",
  "demotion",
  "pay_retention",
  "acting_higher_duty",
] as const

export function GpgGradeMovementCreateDialog({
  assignments,
  classifications,
  payGrades,
  payBands,
  salaryVersions,
}: {
  assignments: readonly GpgActiveAssignmentChoiceRow[]
  classifications: readonly GpgClassificationChoiceRow[]
  payGrades: readonly GpgPayGradeChoiceRow[]
  payBands: readonly GpgPayGradeChoiceRow[]
  salaryVersions: readonly GpgSalaryTableVersionChoiceRow[]
}) {
  const t = useTranslations("Erp.Hrm.governmentPayGrades")
  const [state, formAction, pending] = useActionState<
    CreateGpgGradeMovementFormState | undefined,
    FormData
  >(createGpgGradeMovementAction, undefined)

  const error = state && !state.ok ? state.errors : null
  const ready =
    assignments.length > 0 &&
    classifications.length > 0 &&
    payGrades.length > 0 &&
    salaryVersions.length > 0

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          {t("createGradeMovement")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("createGradeMovementTitle")}</DialogTitle>
          <DialogDescription>
            {t("createGradeMovementDescription")}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="gpg-mv-emp">{t("fieldEmployee")}</FieldLabel>
            <select
              id="gpg-mv-emp"
              name="employeeId"
              className={SELECT_CLASS}
              required
              disabled={pending || !ready}
            >
              {assignments.map((row) => (
                <option key={row.employeeId} value={row.employeeId}>
                  {row.employeeLabel}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="gpg-mv-type">
              {t("fieldMovementType")}
            </FieldLabel>
            <select
              id="gpg-mv-type"
              name="movementType"
              className={SELECT_CLASS}
              required
              disabled={pending || !ready}
            >
              {WIZARD_MOVEMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`movementTypeLabels.${type}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="gpg-mv-cls">
              {t("fieldTargetClassification")}
            </FieldLabel>
            <select
              id="gpg-mv-cls"
              name="classificationId"
              className={SELECT_CLASS}
              required
              disabled={pending || !ready}
            >
              {classifications.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.label}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="gpg-mv-grade">
              {t("fieldTargetPayGrade")}
            </FieldLabel>
            <select
              id="gpg-mv-grade"
              name="toPayGradeId"
              className={SELECT_CLASS}
              required
              disabled={pending || !ready}
            >
              {payGrades.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.label}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="gpg-mv-step">
              {t("fieldTargetStep")}
            </FieldLabel>
            <Input
              id="gpg-mv-step"
              name="toStep"
              type="number"
              min={1}
              max={99}
              defaultValue={1}
              required
              disabled={pending || !ready}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="gpg-mv-version">
              {t("fieldSalaryTableVersion")}
            </FieldLabel>
            <select
              id="gpg-mv-version"
              name="salaryTableVersionId"
              className={SELECT_CLASS}
              required
              disabled={pending || !ready}
            >
              {salaryVersions.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.label}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="gpg-mv-band">
              {t("fieldPayBandOptional")}
            </FieldLabel>
            <select
              id="gpg-mv-band"
              name="payBandId"
              className={SELECT_CLASS}
              disabled={pending || !ready}
            >
              <option value="">{t("optionalNone")}</option>
              {payBands.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.label}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="gpg-mv-effective">
              {t("fieldEffectiveDate")}
            </FieldLabel>
            <Input
              id="gpg-mv-effective"
              name="effectiveDate"
              type="date"
              required
              disabled={pending || !ready}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="gpg-mv-retention">
              {t("fieldRetentionAmount")}
            </FieldLabel>
            <Input
              id="gpg-mv-retention"
              name="retentionAmount"
              disabled={pending || !ready}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="gpg-mv-reason">{t("fieldReason")}</FieldLabel>
            <Input
              id="gpg-mv-reason"
              name="reason"
              disabled={pending || !ready}
            />
          </Field>
          {error?.form ? <FieldError>{error.form}</FieldError> : null}
          <Button type="submit" disabled={pending || !ready}>
            {pending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              t("submitGradeMovementDraft")
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
