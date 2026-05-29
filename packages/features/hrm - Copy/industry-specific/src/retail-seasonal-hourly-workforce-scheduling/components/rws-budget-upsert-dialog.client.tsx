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

import { upsertRwsLaborBudgetAction } from "../actions/rws-budget.actions"
import type { UpsertRwsLaborBudgetFormState } from "@afenda/feature-hrm-core/shared"
import type {
  RwsSchedulePeriodRow,
  RwsStoreChoiceRow,
} from "../data/rws.types.shared"

const SELECT_CLASS =
  "h-9 w-full rounded border border-border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"

type RwsBudgetUpsertDialogProps = {
  periods: readonly RwsSchedulePeriodRow[]
  storeChoices: readonly RwsStoreChoiceRow[]
}

export function RwsBudgetUpsertDialog({
  periods,
  storeChoices,
}: RwsBudgetUpsertDialogProps) {
  const t = useTranslations("Erp.Hrm.retailScheduling")
  const [state, formAction, pending] = useActionState<
    UpsertRwsLaborBudgetFormState | undefined,
    FormData
  >(upsertRwsLaborBudgetAction, undefined)

  const error = state && !state.ok ? state.errors : null
  const defaultPeriod = periods[0]

  if (periods.length === 0 || storeChoices.length === 0) {
    return null
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          {t("upsertBudget")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("upsertBudgetTitle")}</DialogTitle>
          <DialogDescription>{t("upsertBudgetDescription")}</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="rws-budget-period">
              {t("fieldSchedulePeriod")}
            </FieldLabel>
            <select
              id="rws-budget-period"
              name="schedulePeriodId"
              className={SELECT_CLASS}
              required
              defaultValue={defaultPeriod?.id ?? ""}
            >
              {periods.map((period) => (
                <option key={period.id} value={period.id}>
                  {period.code} — {period.storeLabel}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="rws-budget-store">{t("fieldStore")}</FieldLabel>
            <select
              id="rws-budget-store"
              name="storeId"
              className={SELECT_CLASS}
              required
              defaultValue={defaultPeriod?.storeId ?? storeChoices[0]?.id ?? ""}
            >
              {storeChoices.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.label}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="rws-budget-amount">
              {t("fieldApprovedBudget")}
            </FieldLabel>
            <Input
              id="rws-budget-amount"
              name="approvedBudgetAmount"
              required
              placeholder="10000.00"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="rws-budget-currency">
              {t("fieldCurrency")}
            </FieldLabel>
            <Input id="rws-budget-currency" name="currencyCode" defaultValue="USD" />
          </Field>
          <Field>
            <FieldLabel htmlFor="rws-budget-notes">{t("fieldNotes")}</FieldLabel>
            <Input id="rws-budget-notes" name="notes" />
          </Field>
          {error?.form ? <FieldError>{error.form}</FieldError> : null}
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            {t("saveBudget")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
