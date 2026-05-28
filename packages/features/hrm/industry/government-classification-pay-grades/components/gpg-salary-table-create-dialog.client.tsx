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

import { createGpgSalaryTableVersionAction } from "../actions/gpg-master.actions"
import type { CreateGpgSalaryTableVersionFormState } from "../../../_core/shared"

export function GpgSalaryTableCreateDialog() {
  const t = useTranslations("Erp.Hrm.governmentPayGrades")
  const [state, formAction, pending] = useActionState<
    CreateGpgSalaryTableVersionFormState | undefined,
    FormData
  >(createGpgSalaryTableVersionAction, undefined)

  const error = state && !state.ok ? state.errors : null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          {t("createSalaryTable")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createSalaryTableTitle")}</DialogTitle>
          <DialogDescription>
            {t("createSalaryTableDescription")}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="gpg-st-code">{t("fieldCode")}</FieldLabel>
            <Input id="gpg-st-code" name="code" required disabled={pending} />
          </Field>
          <Field>
            <FieldLabel htmlFor="gpg-st-effective">
              {t("fieldEffectiveDate")}
            </FieldLabel>
            <Input
              id="gpg-st-effective"
              name="effectiveDate"
              type="date"
              required
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
              t("save")
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
