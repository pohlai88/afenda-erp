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

import { createRwsSchedulePeriodAction } from "../actions/rws-period.actions"
import { HRM_RWS_PERIOD_KINDS } from "../schemas/rws-workflow-state.shared"
import type { CreateRwsSchedulePeriodFormState } from "../../../_core/shared"
import type {
  RwsSchedulePeriodRow,
  RwsStoreChoiceRow,
} from "../data/rws.types.shared"

const SELECT_CLASS =
  "h-9 w-full rounded border border-border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"

type RwsPeriodCreateDialogProps = {
  storeChoices: readonly RwsStoreChoiceRow[]
  periods: readonly RwsSchedulePeriodRow[]
}

export function RwsPeriodCreateDialog({
  storeChoices,
  periods,
}: RwsPeriodCreateDialogProps) {
  const t = useTranslations("Erp.Hrm.retailScheduling")
  const [state, formAction, pending] = useActionState<
    CreateRwsSchedulePeriodFormState | undefined,
    FormData
  >(createRwsSchedulePeriodAction, undefined)

  const error = state && !state.ok ? state.errors : null
  const draftPeriods = periods.filter((p) => p.state === "draft")

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          {t("createPeriod")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("createPeriodTitle")}</DialogTitle>
          <DialogDescription>{t("createPeriodDescription")}</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="rws-period-store">{t("fieldStore")}</FieldLabel>
            <select
              id="rws-period-store"
              name="storeId"
              className={SELECT_CLASS}
              required
              defaultValue=""
            >
              <option value="" disabled>
                {t("selectStore")}
              </option>
              {storeChoices.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.label}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="rws-period-code">{t("fieldCode")}</FieldLabel>
            <Input id="rws-period-code" name="code" required />
          </Field>
          <Field>
            <FieldLabel htmlFor="rws-period-name">{t("fieldName")}</FieldLabel>
            <Input id="rws-period-name" name="name" required />
          </Field>
          <Field>
            <FieldLabel htmlFor="rws-period-kind">{t("fieldPeriodKind")}</FieldLabel>
            <select
              id="rws-period-kind"
              name="periodKind"
              className={SELECT_CLASS}
              defaultValue="weekly"
            >
              {HRM_RWS_PERIOD_KINDS.map((kind) => (
                <option key={kind} value={kind}>
                  {t(`periodKindLabels.${kind}`)}
                </option>
              ))}
            </select>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="rws-period-start">
                {t("fieldPeriodStart")}
              </FieldLabel>
              <Input
                id="rws-period-start"
                name="periodStartDate"
                type="date"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="rws-period-end">{t("fieldPeriodEnd")}</FieldLabel>
              <Input
                id="rws-period-end"
                name="periodEndDate"
                type="date"
                required
              />
            </Field>
          </div>
          {error?.form ? <FieldError>{error.form}</FieldError> : null}
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            {t("savePeriod")}
          </Button>
        </form>
        {draftPeriods.length > 0 ? (
          <p className="text-xs text-muted-foreground">{t("publishHint")}</p>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
