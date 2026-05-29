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

import { createFrmTravelStatusAction } from "../actions/frm-travel.actions"
import type { CreateFrmTravelStatusFormState } from "@afenda/feature-hrm-core/shared"
import { HRM_FRM_TRAVEL_CLASSES } from "../schemas/frm-workflow-state.shared"

const SELECT_CLASS =
  "h-9 w-full rounded border border-border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"

type Choice = { readonly id: string; readonly label: string }

export function FrmTravelCreateDialog({
  assignments,
}: {
  assignments: readonly Choice[]
}) {
  const t = useTranslations("Erp.Hrm.fieldWorkforce")
  const [state, formAction, pending] = useActionState<
    CreateFrmTravelStatusFormState | undefined,
    FormData
  >(createFrmTravelStatusAction, undefined)

  const error = state && !state.ok ? state.errors : null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          {t("createTravel")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createTravelTitle")}</DialogTitle>
          <DialogDescription>{t("createTravelDescription")}</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="frm-trv-asg">{t("colAssignment")}</FieldLabel>
            <select
              id="frm-trv-asg"
              name="assignmentId"
              className={SELECT_CLASS}
              required
              disabled={pending}
            >
              <option value="">{t("selectAssignment")}</option>
              {assignments.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.label}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="frm-trv-class">
              {t("colTravelClass")}
            </FieldLabel>
            <select
              id="frm-trv-class"
              name="travelClass"
              className={SELECT_CLASS}
              disabled={pending}
              defaultValue="local_field_visit"
            >
              {HRM_FRM_TRAVEL_CLASSES.map((travelClass) => (
                <option key={travelClass} value={travelClass}>
                  {t(`travelClassLabels.${travelClass}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="frm-trv-start">{t("colStart")}</FieldLabel>
            <Input
              id="frm-trv-start"
              name="startDate"
              type="date"
              required
              disabled={pending}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="frm-trv-end">{t("colEnd")}</FieldLabel>
            <Input
              id="frm-trv-end"
              name="endDate"
              type="date"
              disabled={pending}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="frm-trv-country">
              {t("fieldCountry")}
            </FieldLabel>
            <Input
              id="frm-trv-country"
              name="destinationCountry"
              disabled={pending}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="frm-trv-city">{t("fieldCity")}</FieldLabel>
            <Input
              id="frm-trv-city"
              name="destinationCity"
              disabled={pending}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="frm-trv-approval">
              {t("fieldTravelApprovalRef")}
            </FieldLabel>
            <Input
              id="frm-trv-approval"
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
              t("saveTravel")
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
