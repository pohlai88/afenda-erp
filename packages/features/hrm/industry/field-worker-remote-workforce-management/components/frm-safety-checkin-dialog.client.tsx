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

import { createFrmSafetyCheckinAction } from "../actions/frm-safety.actions"
import type { CreateFrmSafetyCheckinFormState } from "../../../_core/shared"
import { HRM_FRM_SAFETY_EVENT_TYPES } from "../schemas/frm-workflow-state.shared"

const SELECT_CLASS =
  "h-9 w-full rounded border border-border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"

type AssignmentChoice = { readonly id: string; readonly label: string }

export function FrmSafetyCheckinDialog({
  assignments,
}: {
  assignments: readonly AssignmentChoice[]
}) {
  const t = useTranslations("Erp.Hrm.fieldWorkforce")
  const [state, formAction, pending] = useActionState<
    CreateFrmSafetyCheckinFormState | undefined,
    FormData
  >(createFrmSafetyCheckinAction, undefined)

  const error = state && !state.ok ? state.errors : null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          {t("recordSafetyCheckin")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("safetyCheckinTitle")}</DialogTitle>
          <DialogDescription>{t("safetyCheckinDescription")}</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="frm-safety-asg">
              {t("colAssignment")}
            </FieldLabel>
            <select
              id="frm-safety-asg"
              name="assignmentId"
              className={SELECT_CLASS}
              required
              disabled={pending || assignments.length === 0}
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
            <FieldLabel htmlFor="frm-safety-event">
              {t("colSafetyEvent")}
            </FieldLabel>
            <select
              id="frm-safety-event"
              name="eventType"
              className={SELECT_CLASS}
              required
              disabled={pending}
              defaultValue="arrival"
            >
              {HRM_FRM_SAFETY_EVENT_TYPES.map((eventType) => (
                <option key={eventType} value={eventType}>
                  {t(`safetyEventLabels.${eventType}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="frm-safety-lat">
              {t("fieldLatitude")}
            </FieldLabel>
            <Input
              id="frm-safety-lat"
              name="latitude"
              inputMode="decimal"
              disabled={pending}
              placeholder={t("optionalCoordinates")}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="frm-safety-lng">
              {t("fieldLongitude")}
            </FieldLabel>
            <Input
              id="frm-safety-lng"
              name="longitude"
              inputMode="decimal"
              disabled={pending}
              placeholder={t("optionalCoordinates")}
            />
          </Field>
          {error?.form ? <FieldError>{error.form}</FieldError> : null}
          {state?.ok ? (
            <p className="text-xs text-muted-foreground">
              {t("safetyCheckinSuccess")}
            </p>
          ) : null}
          <Button type="submit" disabled={pending || assignments.length === 0}>
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                {t("saving")}
              </>
            ) : (
              t("saveSafetyCheckin")
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
