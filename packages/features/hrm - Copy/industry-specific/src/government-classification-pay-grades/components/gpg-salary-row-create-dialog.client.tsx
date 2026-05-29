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

import { createGpgSalaryTableRowAction } from "../actions/gpg-master.actions"
import type { GpgPayGradeChoiceRow } from "../data/gpg.types.shared"
import type { CreateGpgSalaryTableRowFormState } from "@afenda/feature-hrm-core/shared"

const SELECT_CLASS =
  "h-9 w-full rounded border border-border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"

export function GpgSalaryRowCreateDialog({
  tableVersionId,
  payGrades,
}: {
  tableVersionId: string
  payGrades: readonly GpgPayGradeChoiceRow[]
}) {
  const t = useTranslations("Erp.Hrm.governmentPayGrades")
  const [state, formAction, pending] = useActionState<
    CreateGpgSalaryTableRowFormState | undefined,
    FormData
  >(createGpgSalaryTableRowAction, undefined)

  const error = state && !state.ok ? state.errors : null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          {t("addSalaryRow")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("addSalaryRowTitle")}</DialogTitle>
          <DialogDescription>{t("addSalaryRowDescription")}</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="tableVersionId" value={tableVersionId} />
          <Field>
            <FieldLabel htmlFor="gpg-sr-grade">{t("fieldPayGrade")}</FieldLabel>
            <select
              id="gpg-sr-grade"
              name="payGradeId"
              className={SELECT_CLASS}
              required
              disabled={pending || payGrades.length === 0}
            >
              {payGrades.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.label}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="gpg-sr-step">{t("fieldStep")}</FieldLabel>
            <Input
              id="gpg-sr-step"
              name="step"
              type="number"
              min={1}
              defaultValue={1}
              required
              disabled={pending}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="gpg-sr-base">{t("fieldBaseRate")}</FieldLabel>
            <Input
              id="gpg-sr-base"
              name="baseRate"
              required
              disabled={pending}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="gpg-sr-min">{t("fieldMinRate")}</FieldLabel>
            <Input id="gpg-sr-min" name="minRate" disabled={pending} />
          </Field>
          <Field>
            <FieldLabel htmlFor="gpg-sr-max">{t("fieldMaxRate")}</FieldLabel>
            <Input id="gpg-sr-max" name="maxRate" disabled={pending} />
          </Field>
          <Field>
            <FieldLabel htmlFor="gpg-sr-currency">
              {t("fieldCurrency")}
            </FieldLabel>
            <Input
              id="gpg-sr-currency"
              name="currencyCode"
              defaultValue="USD"
              disabled={pending}
            />
          </Field>
          {error?.form ? <FieldError>{error.form}</FieldError> : null}
          <Button type="submit" disabled={pending || payGrades.length === 0}>
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
