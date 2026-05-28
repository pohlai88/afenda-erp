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

import { createRwsCoverageSlotAction } from "../actions/rws-coverage.actions"
import { HRM_RWS_RETAIL_ROLES } from "../schemas/rws-workflow-state.shared"
import type { CreateRwsCoverageSlotFormState } from "../../../_core/shared"
import type {
  RwsSchedulePeriodRow,
  RwsStoreChoiceRow,
} from "../data/rws.types.shared"

const SELECT_CLASS =
  "h-9 w-full rounded border border-border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"

type RwsCoverageSlotCreateDialogProps = {
  draftPeriods: readonly RwsSchedulePeriodRow[]
  storeChoices: readonly RwsStoreChoiceRow[]
}

export function RwsCoverageSlotCreateDialog({
  draftPeriods,
  storeChoices,
}: RwsCoverageSlotCreateDialogProps) {
  const t = useTranslations("Erp.Hrm.retailScheduling")
  const [state, formAction, pending] = useActionState<
    CreateRwsCoverageSlotFormState | undefined,
    FormData
  >(createRwsCoverageSlotAction, undefined)

  const error = state && !state.ok ? state.errors : null
  const defaultPeriod = draftPeriods[0]

  if (draftPeriods.length === 0 || storeChoices.length === 0) {
    return null
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          {t("createCoverageSlot")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("createCoverageSlotTitle")}</DialogTitle>
          <DialogDescription>{t("createCoverageSlotDescription")}</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="rws-coverage-period">
              {t("fieldSchedulePeriod")}
            </FieldLabel>
            <select
              id="rws-coverage-period"
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
            <FieldLabel htmlFor="rws-coverage-store">{t("fieldStore")}</FieldLabel>
            <select
              id="rws-coverage-store"
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
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="rws-coverage-date">{t("fieldSlotDate")}</FieldLabel>
              <Input
                id="rws-coverage-date"
                name="slotDate"
                type="date"
                required
                defaultValue={defaultPeriod?.periodStartDate}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="rws-coverage-hour">{t("fieldHour")}</FieldLabel>
              <Input
                id="rws-coverage-hour"
                name="hourOfDay"
                type="number"
                min={0}
                max={23}
                required
                defaultValue={9}
              />
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="rws-coverage-role">{t("fieldRole")}</FieldLabel>
            <select
              id="rws-coverage-role"
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
            <FieldLabel htmlFor="rws-coverage-headcount">
              {t("fieldRequiredHeadcount")}
            </FieldLabel>
            <Input
              id="rws-coverage-headcount"
              name="requiredHeadcount"
              type="number"
              min={1}
              max={99}
              required
              defaultValue={1}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="rws-coverage-dept">{t("fieldDepartment")}</FieldLabel>
            <Input id="rws-coverage-dept" name="departmentRef" />
          </Field>
          {error?.form ? <FieldError>{error.form}</FieldError> : null}
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            {t("saveCoverageSlot")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
