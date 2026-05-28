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

import { createFhcRequirementRuleAction } from "../actions/fhc-requirement-rule.actions"
import type { CreateFhcRequirementRuleFormState } from "../../../_core/shared"
import type { FhcOutletChoiceRow } from "../data/fhc.types.shared"

const SELECT_CLASS =
  "h-9 w-full rounded border border-border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"

type FhcRequirementRuleCreateDialogProps = {
  outlets: readonly FhcOutletChoiceRow[]
}

export function FhcRequirementRuleCreateDialog({
  outlets,
}: FhcRequirementRuleCreateDialogProps) {
  const t = useTranslations("Erp.Hrm.foodHandlerCompliance")
  const outletFieldId = useId()
  const [state, formAction, pending] = useActionState<
    CreateFhcRequirementRuleFormState | undefined,
    FormData
  >(createFhcRequirementRuleAction, undefined)

  const error = state && !state.ok ? state.errors : null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          {t("createRequirementRule")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createRequirementRuleTitle")}</DialogTitle>
          <DialogDescription>
            {t("createRequirementRuleDescription")}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor={outletFieldId}>{t("fieldOutlet")}</FieldLabel>
            <select
              id={outletFieldId}
              name="outletId"
              className={SELECT_CLASS}
              disabled={pending}
            >
              <option value="">{t("anyOutlet")}</option>
              {outlets.map((outlet) => (
                <option key={outlet.id} value={outlet.id}>
                  {outlet.code} · {outlet.name}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="fhc-country">{t("fieldCountry")}</FieldLabel>
            <Input
              id="fhc-country"
              name="countryCode"
              placeholder={t("fieldCountryPlaceholder")}
              disabled={pending}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="fhc-entity">
              {t("fieldLegalEntity")}
            </FieldLabel>
            <Input id="fhc-entity" name="legalEntityRef" disabled={pending} />
          </Field>
          <Field>
            <FieldLabel htmlFor="fhc-role">{t("fieldRole")}</FieldLabel>
            <Input
              id="fhc-role"
              name="roleRef"
              placeholder={t("fieldRolePlaceholder")}
              disabled={pending}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="fhc-dept">{t("fieldDepartment")}</FieldLabel>
            <Input
              id="fhc-dept"
              name="departmentRef"
              placeholder={t("fieldDepartmentPlaceholder")}
              disabled={pending}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="fhc-cat">{t("fieldCategory")}</FieldLabel>
            <Input id="fhc-cat" name="employeeCategoryRef" disabled={pending} />
          </Field>
          <div className="flex flex-col gap-2 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="requiresPermit"
                defaultChecked
                disabled={pending}
              />
              {t("requiresPermit")}
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="requiresHygieneTraining"
                defaultChecked
                disabled={pending}
              />
              {t("requiresHygiene")}
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="requiresAllergenTraining"
                disabled={pending}
              />
              {t("requiresAllergen")}
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="requiresHealthCertificate"
                disabled={pending}
              />
              {t("requiresHealth")}
            </label>
          </div>
          {error?.form ? <FieldError>{error.form}</FieldError> : null}
          <Button type="submit" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                {t("saving")}
              </>
            ) : (
              t("saveRequirementRule")
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
