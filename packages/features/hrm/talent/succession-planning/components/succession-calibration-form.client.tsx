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
import { Textarea } from "@afenda/ui/textarea"

import { createSuccessionCalibrationSessionAction } from "../actions/succession-calibration.actions"
import type { SuccessionMutationFormState } from "../schemas/succession.schema"

export function SuccessionCalibrationSessionFormDialog() {
  const t = useTranslations("Erp.Hrm.successionPlanning")
  const [state, formAction, pending] = useActionState<
    SuccessionMutationFormState | undefined,
    FormData
  >(createSuccessionCalibrationSessionAction, undefined)

  const error = state && !state.ok ? state.errors : null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          {t("createCalibrationSession")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createCalibrationSessionTitle")}</DialogTitle>
          <DialogDescription>{t("createCalibrationSessionDescription")}</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="succession-calibration-title">{t("fieldTitle")}</FieldLabel>
            <Input id="succession-calibration-title" name="title" required />
          </Field>
          <Field>
            <FieldLabel htmlFor="succession-calibration-date">{t("fieldSessionDate")}</FieldLabel>
            <Input id="succession-calibration-date" name="sessionDate" type="date" />
          </Field>
          <Field>
            <FieldLabel htmlFor="succession-calibration-notes">{t("fieldNotes")}</FieldLabel>
            <Textarea id="succession-calibration-notes" name="notes" rows={2} />
          </Field>
          {error?.form ? <FieldError>{error.form}</FieldError> : null}
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            {t("saveCalibrationSession")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
