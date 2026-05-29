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

import { createGpgEmployeeAssignmentAction } from "../actions/gpg-assignment.actions"
import { HRM_GPG_APPOINTMENT_TYPES } from "../schemas/gpg-workflow-state.shared"
import type {
  GpgClassificationChoiceRow,
  GpgEmployeeChoiceRow,
  GpgPayGradeChoiceRow,
  GpgSalaryTableVersionChoiceRow,
} from "../data/gpg.types.shared"
import type { CreateGpgEmployeeAssignmentFormState } from "@afenda/feature-hrm-core/shared"

const SELECT_CLASS =
  "h-9 w-full rounded border border-border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"

export function GpgAssignmentCreateDialog({
  employees,
  classifications,
  payGrades,
  payBands,
  salaryVersions,
}: {
  employees: readonly GpgEmployeeChoiceRow[]
  classifications: readonly GpgClassificationChoiceRow[]
  payGrades: readonly GpgPayGradeChoiceRow[]
  payBands: readonly GpgPayGradeChoiceRow[]
  salaryVersions: readonly GpgSalaryTableVersionChoiceRow[]
}) {
  const t = useTranslations("Erp.Hrm.governmentPayGrades")
  const [state, formAction, pending] = useActionState<
    CreateGpgEmployeeAssignmentFormState | undefined,
    FormData
  >(createGpgEmployeeAssignmentAction, undefined)

  const error = state && !state.ok ? state.errors : null
  const ready =
    employees.length > 0 &&
    classifications.length > 0 &&
    payGrades.length > 0 &&
    salaryVersions.length > 0

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          {t("createAssignment")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("createAssignmentTitle")}</DialogTitle>
          <DialogDescription>
            {t("createAssignmentDescription")}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="gpg-as-emp">{t("fieldEmployee")}</FieldLabel>
            <select
              id="gpg-as-emp"
              name="employeeId"
              className={SELECT_CLASS}
              required
              disabled={pending || !ready}
            >
              {employees.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.label}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="gpg-as-class">
              {t("fieldClassification")}
            </FieldLabel>
            <select
              id="gpg-as-class"
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
            <FieldLabel htmlFor="gpg-as-grade">{t("fieldPayGrade")}</FieldLabel>
            <select
              id="gpg-as-grade"
              name="payGradeId"
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
            <FieldLabel htmlFor="gpg-as-band">
              {t("fieldPayBandOptional")}
            </FieldLabel>
            <select
              id="gpg-as-band"
              name="payBandId"
              className={SELECT_CLASS}
              disabled={pending}
              defaultValue=""
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
            <FieldLabel htmlFor="gpg-as-version">
              {t("fieldSalaryTableVersion")}
            </FieldLabel>
            <select
              id="gpg-as-version"
              name="salaryTableVersionId"
              className={SELECT_CLASS}
              required
              disabled={pending || salaryVersions.length === 0}
            >
              {salaryVersions.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.label}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="gpg-as-step">{t("fieldStep")}</FieldLabel>
            <Input
              id="gpg-as-step"
              name="step"
              type="number"
              min={1}
              defaultValue={1}
              required
              disabled={pending}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="gpg-as-appt">
              {t("fieldAppointmentType")}
            </FieldLabel>
            <select
              id="gpg-as-appt"
              name="appointmentType"
              className={SELECT_CLASS}
              disabled={pending}
              defaultValue="permanent"
            >
              {HRM_GPG_APPOINTMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`appointmentTypeLabels.${type}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="gpg-as-from">
              {t("fieldEffectiveFrom")}
            </FieldLabel>
            <Input
              id="gpg-as-from"
              name="effectiveFrom"
              type="date"
              required
              disabled={pending}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="gpg-as-pos">
              {t("fieldPositionRef")}
            </FieldLabel>
            <Input id="gpg-as-pos" name="positionId" disabled={pending} />
          </Field>
          {error?.form ? <FieldError>{error.form}</FieldError> : null}
          <Button type="submit" disabled={pending || !ready}>
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
