"use client"

import { useActionState, useId } from "react"
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

import { createFhcDutyRestrictionAction } from "../actions/fhc-duty.actions"
import type { CreateFhcDutyRestrictionFormState } from "../../../_core/shared"
import type { FhcEmployeeObligationRow } from "../data/fhc.types.shared"
import { HRM_FHC_RESTRICTION_SCOPES } from "../schemas/fhc-workflow-state.shared"

const SELECT_CLASS =
  "h-9 w-full rounded border border-border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"

type FhcDutyRestrictionCreateDialogProps = {
  obligations: readonly FhcEmployeeObligationRow[]
}

export function FhcDutyRestrictionCreateDialog({
  obligations,
}: FhcDutyRestrictionCreateDialogProps) {
  const t = useTranslations("Erp.Hrm.foodHandlerCompliance")
  const obligationFieldId = useId()
  const [state, formAction, pending] = useActionState<
    CreateFhcDutyRestrictionFormState | undefined,
    FormData
  >(createFhcDutyRestrictionAction, undefined)

  const error = state && !state.ok ? state.errors : null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          {t("createDutyRestriction")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createDutyRestrictionTitle")}</DialogTitle>
          <DialogDescription>
            {t("createDutyRestrictionDescription")}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor={obligationFieldId}>
              {t("fieldObligation")}
            </FieldLabel>
            <select
              id={obligationFieldId}
              name="obligationId"
              className={SELECT_CLASS}
              required
              disabled={pending}
            >
              <option value="">{t("fieldObligationPlaceholder")}</option>
              {obligations.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.employeeLabel}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="fhc-restriction-scope">
              {t("fieldRestrictionScope")}
            </FieldLabel>
            <select
              id="fhc-restriction-scope"
              name="restrictionScope"
              className={SELECT_CLASS}
              required
              disabled={pending}
              defaultValue="food_handling"
            >
              {HRM_FHC_RESTRICTION_SCOPES.map((scope) => (
                <option key={scope} value={scope}>
                  {t(`restrictionScopeLabels.${scope}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="fhc-restriction-from">
              {t("fieldEffectiveFrom")}
            </FieldLabel>
            <Input
              id="fhc-restriction-from"
              name="effectiveFrom"
              type="date"
              required
              disabled={pending}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="fhc-restriction-to">
              {t("fieldEffectiveTo")}
            </FieldLabel>
            <Input
              id="fhc-restriction-to"
              name="effectiveTo"
              type="date"
              disabled={pending}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="fhc-restriction-reason">
              {t("fieldRestrictionReason")}
            </FieldLabel>
            <Input
              id="fhc-restriction-reason"
              name="reason"
              disabled={pending}
            />
            {error?.form ? <FieldError>{error.form}</FieldError> : null}
          </Field>
          <Button type="submit" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                {t("saving")}
              </>
            ) : (
              t("saveDutyRestriction")
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
