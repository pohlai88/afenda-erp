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

import { createFrmAssignmentAction } from "../actions/frm-assignment.actions"
import type { CreateFrmAssignmentFormState } from "@afenda/feature-hrm-core/shared"
import { HRM_FRM_ASSIGNMENT_TYPES } from "../schemas/frm-workflow-state.shared"

const SELECT_CLASS =
  "h-9 w-full rounded border border-border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"

type Choice = { readonly id: string; readonly label: string }

export function FrmAssignmentCreateDialog({
  employees,
  worksites,
}: {
  employees: readonly Choice[]
  worksites: readonly Choice[]
}) {
  const t = useTranslations("Erp.Hrm.fieldWorkforce")
  const [state, formAction, pending] = useActionState<
    CreateFrmAssignmentFormState | undefined,
    FormData
  >(createFrmAssignmentAction, undefined)

  const error = state && !state.ok ? state.errors : null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          {t("createAssignment")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createAssignmentTitle")}</DialogTitle>
          <DialogDescription>
            {t("createAssignmentDescription")}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="frm-asg-emp">{t("colEmployee")}</FieldLabel>
            <select
              id="frm-asg-emp"
              name="employeeId"
              className={SELECT_CLASS}
              required
              disabled={pending}
            >
              <option value="">{t("selectEmployee")}</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.label}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="frm-asg-ws">{t("colWorksite")}</FieldLabel>
            <select
              id="frm-asg-ws"
              name="worksiteId"
              className={SELECT_CLASS}
              required
              disabled={pending}
            >
              <option value="">{t("selectWorksite")}</option>
              {worksites.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.label}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="frm-asg-type">{t("colType")}</FieldLabel>
            <select
              id="frm-asg-type"
              name="assignmentType"
              className={SELECT_CLASS}
              disabled={pending}
              defaultValue="project"
            >
              {HRM_FRM_ASSIGNMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`assignmentTypeLabels.${type}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="frm-asg-start">{t("colStart")}</FieldLabel>
            <Input
              id="frm-asg-start"
              name="startDate"
              type="date"
              required
              disabled={pending}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="frm-asg-end">{t("colEnd")}</FieldLabel>
            <Input
              id="frm-asg-end"
              name="endDate"
              type="date"
              disabled={pending}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="frm-asg-travel-ref">
              {t("fieldTravelApprovalRef")}
            </FieldLabel>
            <Input
              id="frm-asg-travel-ref"
              name="travelApprovalRef"
              disabled={pending}
            />
          </Field>
          {error?.form ? <FieldError>{error.form}</FieldError> : null}
          <Button type="submit" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                {t("saving")}
              </>
            ) : (
              t("saveAssignment")
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
