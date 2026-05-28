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

import { createGpgReclassificationRequestAction } from "../actions/gpg-reclassification.actions"
import type {
  GpgClassificationChoiceRow,
  GpgEmployeeChoiceRow,
} from "../data/gpg.types.shared"
import type { CreateGpgReclassificationRequestFormState } from "../../../_core/shared"

const SELECT_CLASS =
  "h-9 w-full rounded border border-border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"

export function GpgReclassificationCreateDialog({
  employees,
  classifications,
}: {
  employees: readonly GpgEmployeeChoiceRow[]
  classifications: readonly GpgClassificationChoiceRow[]
}) {
  const t = useTranslations("Erp.Hrm.governmentPayGrades")
  const [state, formAction, pending] = useActionState<
    CreateGpgReclassificationRequestFormState | undefined,
    FormData
  >(createGpgReclassificationRequestAction, undefined)

  const error = state && !state.ok ? state.errors : null
  const ready = employees.length > 0 && classifications.length > 0

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          {t("createReclassification")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("createReclassificationTitle")}</DialogTitle>
          <DialogDescription>
            {t("createReclassificationDescription")}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="gpg-rc-emp">{t("fieldEmployee")}</FieldLabel>
            <select
              id="gpg-rc-emp"
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
            <FieldLabel htmlFor="gpg-rc-from">
              {t("fieldFromClassification")}
            </FieldLabel>
            <select
              id="gpg-rc-from"
              name="fromClassificationId"
              className={SELECT_CLASS}
              disabled={pending || !ready}
            >
              <option value="">{t("anyCriteria")}</option>
              {classifications.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.label}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="gpg-rc-to">
              {t("fieldTargetClassification")}
            </FieldLabel>
            <select
              id="gpg-rc-to"
              name="toClassificationId"
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
            <FieldLabel htmlFor="gpg-rc-reason">{t("fieldReason")}</FieldLabel>
            <Input id="gpg-rc-reason" name="reason" disabled={pending} />
          </Field>
          {error?.form ? <FieldError>{error.form}</FieldError> : null}
          <Button type="submit" disabled={pending || !ready}>
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                {t("saving")}
              </>
            ) : (
              t("submitReclassification")
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
