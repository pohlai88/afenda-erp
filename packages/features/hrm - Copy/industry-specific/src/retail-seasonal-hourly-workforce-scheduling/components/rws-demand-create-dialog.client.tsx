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

import { createRwsDemandReferenceAction } from "../actions/rws-demand.actions"
import { HRM_RWS_DEMAND_REFERENCE_KINDS } from "../schemas/rws.schema"
import type { CreateRwsDemandReferenceFormState } from "@afenda/feature-hrm-core/shared"
import type {
  RwsSchedulePeriodRow,
  RwsStoreChoiceRow,
} from "../data/rws.types.shared"

const SELECT_CLASS =
  "h-9 w-full rounded border border-border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"

type RwsDemandCreateDialogProps = {
  periods: readonly RwsSchedulePeriodRow[]
  storeChoices: readonly RwsStoreChoiceRow[]
}

export function RwsDemandCreateDialog({
  periods,
  storeChoices,
}: RwsDemandCreateDialogProps) {
  const t = useTranslations("Erp.Hrm.retailScheduling")
  const [state, formAction, pending] = useActionState<
    CreateRwsDemandReferenceFormState | undefined,
    FormData
  >(createRwsDemandReferenceAction, undefined)

  const error = state && !state.ok ? state.errors : null
  const defaultPeriod = periods[0]

  if (periods.length === 0 || storeChoices.length === 0) {
    return null
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          {t("createDemandRef")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createDemandRefTitle")}</DialogTitle>
          <DialogDescription>{t("createDemandRefDescription")}</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="rws-demand-period">
              {t("fieldSchedulePeriod")}
            </FieldLabel>
            <select
              id="rws-demand-period"
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
            <FieldLabel htmlFor="rws-demand-store">{t("fieldStore")}</FieldLabel>
            <select
              id="rws-demand-store"
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
            <FieldLabel htmlFor="rws-demand-kind">{t("fieldReferenceKind")}</FieldLabel>
            <select
              id="rws-demand-kind"
              name="referenceKind"
              className={SELECT_CLASS}
              defaultValue="manual"
            >
              {HRM_RWS_DEMAND_REFERENCE_KINDS.map((kind) => (
                <option key={kind} value={kind}>
                  {t(`demandKindLabels.${kind}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="rws-demand-external">
              {t("colExternalRef")}
            </FieldLabel>
            <Input id="rws-demand-external" name="externalRef" />
          </Field>
          <Field>
            <FieldLabel htmlFor="rws-demand-notes">{t("fieldNotes")}</FieldLabel>
            <Input id="rws-demand-notes" name="notes" />
          </Field>
          {error?.form ? <FieldError>{error.form}</FieldError> : null}
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            {t("saveDemandRef")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
