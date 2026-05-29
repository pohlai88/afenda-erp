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

import { createFrmPerDiemRateAction } from "../actions/frm-per-diem.actions"
import type { CreateFrmPerDiemRateFormState } from "@afenda/feature-hrm-core/shared"
import { HRM_FRM_TRAVEL_CLASSES } from "../schemas/frm-workflow-state.shared"

const SELECT_CLASS =
  "h-9 w-full rounded border border-border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"

export function FrmPerDiemRateCreateDialog() {
  const t = useTranslations("Erp.Hrm.fieldWorkforce")
  const [state, formAction, pending] = useActionState<
    CreateFrmPerDiemRateFormState | undefined,
    FormData
  >(createFrmPerDiemRateAction, undefined)

  const error = state && !state.ok ? state.errors : null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          {t("createPerDiemRate")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createPerDiemRateTitle")}</DialogTitle>
          <DialogDescription>
            {t("createPerDiemRateDescription")}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="frm-rate-code">
              {t("fieldRateCode")}
            </FieldLabel>
            <Input id="frm-rate-code" name="code" required disabled={pending} />
          </Field>
          <Field>
            <FieldLabel htmlFor="frm-rate-amount">
              {t("fieldFullDayAmount")}
            </FieldLabel>
            <Input
              id="frm-rate-amount"
              name="fullDayAmount"
              required
              disabled={pending}
              inputMode="decimal"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="frm-rate-currency">
              {t("fieldCurrency")}
            </FieldLabel>
            <Input
              id="frm-rate-currency"
              name="currencyCode"
              defaultValue="MYR"
              disabled={pending}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="frm-rate-class">
              {t("colTravelClass")}
            </FieldLabel>
            <select
              id="frm-rate-class"
              name="travelClass"
              className={SELECT_CLASS}
              disabled={pending}
            >
              <option value="">{t("anyTravelClass")}</option>
              {HRM_FRM_TRAVEL_CLASSES.map((travelClass) => (
                <option key={travelClass} value={travelClass}>
                  {t(`travelClassLabels.${travelClass}`)}
                </option>
              ))}
            </select>
          </Field>
          {error?.form ? <FieldError>{error.form}</FieldError> : null}
          <Button type="submit" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                {t("saving")}
              </>
            ) : (
              t("savePerDiemRate")
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
