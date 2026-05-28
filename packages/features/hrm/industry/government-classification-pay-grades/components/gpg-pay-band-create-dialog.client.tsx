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

import { createGpgPayBandAction } from "../actions/gpg-master.actions"
import type { GpgPayGradeChoiceRow } from "../data/gpg.types.shared"
import type { CreateGpgPayBandFormState } from "../../../_core/shared"

const SELECT_CLASS =
  "h-9 w-full rounded border border-border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"

export function GpgPayBandCreateDialog({
  payGrades,
}: {
  payGrades: readonly GpgPayGradeChoiceRow[]
}) {
  const t = useTranslations("Erp.Hrm.governmentPayGrades")
  const [state, formAction, pending] = useActionState<
    CreateGpgPayBandFormState | undefined,
    FormData
  >(createGpgPayBandAction, undefined)

  const error = state && !state.ok ? state.errors : null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          {t("createPayBand")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createPayBandTitle")}</DialogTitle>
          <DialogDescription>{t("createPayBandDescription")}</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="gpg-pb-grade">{t("fieldPayGrade")}</FieldLabel>
            <select
              id="gpg-pb-grade"
              name="payGradeId"
              className={SELECT_CLASS}
              required
              disabled={pending || payGrades.length === 0}
            >
              {payGrades.length === 0 ? (
                <option value="">{t("noPayGradesYet")}</option>
              ) : (
                payGrades.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.label}
                  </option>
                ))
              )}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="gpg-pb-code">{t("fieldCode")}</FieldLabel>
            <Input id="gpg-pb-code" name="code" required disabled={pending} />
          </Field>
          <Field>
            <FieldLabel htmlFor="gpg-pb-name">{t("fieldName")}</FieldLabel>
            <Input id="gpg-pb-name" name="name" required disabled={pending} />
          </Field>
          <Field>
            <FieldLabel htmlFor="gpg-pb-effective">
              {t("fieldEffectiveDate")}
            </FieldLabel>
            <Input
              id="gpg-pb-effective"
              name="effectiveDate"
              type="date"
              required
              disabled={pending}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="gpg-pb-min">{t("fieldMinRate")}</FieldLabel>
            <Input id="gpg-pb-min" name="minRate" disabled={pending} />
          </Field>
          <Field>
            <FieldLabel htmlFor="gpg-pb-max">{t("fieldMaxRate")}</FieldLabel>
            <Input id="gpg-pb-max" name="maxRate" disabled={pending} />
          </Field>
          <Field>
            <FieldLabel htmlFor="gpg-pb-currency">
              {t("fieldCurrency")}
            </FieldLabel>
            <Input
              id="gpg-pb-currency"
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
