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

import { createRwsOpenShiftOfferAction } from "../actions/rws-open-shift.actions"
import {
  HRM_RWS_CLAIM_MODES,
  HRM_RWS_RETAIL_ROLES,
} from "../schemas/rws-workflow-state.shared"
import type { CreateRwsOpenShiftOfferFormState } from "@afenda/feature-hrm-core/shared"
import type {
  RwsSchedulePeriodRow,
  RwsStoreChoiceRow,
} from "../data/rws.types.shared"

const SELECT_CLASS =
  "h-9 w-full rounded border border-border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"

type RwsOpenShiftCreateDialogProps = {
  draftPeriods: readonly RwsSchedulePeriodRow[]
  storeChoices: readonly RwsStoreChoiceRow[]
}

export function RwsOpenShiftCreateDialog({
  draftPeriods,
  storeChoices,
}: RwsOpenShiftCreateDialogProps) {
  const t = useTranslations("Erp.Hrm.retailScheduling")
  const [state, formAction, pending] = useActionState<
    CreateRwsOpenShiftOfferFormState | undefined,
    FormData
  >(createRwsOpenShiftOfferAction, undefined)

  const error = state && !state.ok ? state.errors : null
  const defaultPeriod = draftPeriods[0]

  if (draftPeriods.length === 0 || storeChoices.length === 0) {
    return null
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          {t("createOpenShift")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createOpenShiftTitle")}</DialogTitle>
          <DialogDescription>{t("createOpenShiftDescription")}</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="rws-open-period">
              {t("fieldSchedulePeriod")}
            </FieldLabel>
            <select
              id="rws-open-period"
              name="schedulePeriodId"
              className={SELECT_CLASS}
              required
              defaultValue={defaultPeriod?.id ?? ""}
            >
              {draftPeriods.map((period) => (
                <option key={period.id} value={period.id}>
                  {period.code} — {period.storeLabel}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="rws-open-store">{t("fieldStore")}</FieldLabel>
            <select
              id="rws-open-store"
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
            <FieldLabel htmlFor="rws-open-date">{t("fieldSlotDate")}</FieldLabel>
            <Input
              id="rws-open-date"
              name="slotDate"
              type="date"
              required
              defaultValue={defaultPeriod?.periodStartDate}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="rws-open-role">{t("fieldRole")}</FieldLabel>
            <select
              id="rws-open-role"
              name="retailRole"
              className={SELECT_CLASS}
              defaultValue="cashier"
            >
              {HRM_RWS_RETAIL_ROLES.map((role) => (
                <option key={role} value={role}>
                  {t(`retailRoleLabels.${role}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="rws-open-claim">{t("fieldClaimMode")}</FieldLabel>
            <select
              id="rws-open-claim"
              name="claimMode"
              className={SELECT_CLASS}
              defaultValue="first_come"
            >
              {HRM_RWS_CLAIM_MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {t(`claimModeLabels.${mode}`)}
                </option>
              ))}
            </select>
          </Field>
          {error?.form ? <FieldError>{error.form}</FieldError> : null}
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            {t("saveOpenShift")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
