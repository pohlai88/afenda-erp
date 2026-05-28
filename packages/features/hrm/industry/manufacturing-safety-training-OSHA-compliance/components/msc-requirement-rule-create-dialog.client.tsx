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

import { createMscRequirementRuleAction } from "../actions/msc-requirement-rule.actions"
import type { CreateMscRequirementRuleFormState } from "../data/msc-form-state.shared"
import type { MscSiteChoiceRow } from "../data/msc.types.shared"

const SELECT_CLASS =
  "h-9 w-full rounded border border-border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"

type MscRequirementRuleCreateDialogProps = {
  sites: readonly MscSiteChoiceRow[]
}

export function MscRequirementRuleCreateDialog({
  sites,
}: MscRequirementRuleCreateDialogProps) {
  const t = useTranslations("Erp.Hrm.manufacturingSafety")
  const siteFieldId = useId()
  const [state, formAction, pending] = useActionState<
    CreateMscRequirementRuleFormState | undefined,
    FormData
  >(createMscRequirementRuleAction, undefined)

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
            <FieldLabel htmlFor={siteFieldId}>{t("fieldSite")}</FieldLabel>
            <select
              id={siteFieldId}
              name="siteId"
              className={SELECT_CLASS}
              disabled={pending}
            >
              <option value="">{t("anySite")}</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.code} · {site.name}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="msc-country">{t("fieldCountry")}</FieldLabel>
            <Input
              id="msc-country"
              name="countryCode"
              placeholder={t("fieldCountryPlaceholder")}
              disabled={pending}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="msc-entity">
              {t("fieldLegalEntity")}
            </FieldLabel>
            <Input id="msc-entity" name="legalEntityRef" disabled={pending} />
          </Field>
          <Field>
            <FieldLabel htmlFor="msc-role">{t("fieldRole")}</FieldLabel>
            <Input
              id="msc-role"
              name="roleRef"
              placeholder={t("fieldRolePlaceholder")}
              disabled={pending}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="msc-dept">{t("fieldDepartment")}</FieldLabel>
            <Input
              id="msc-dept"
              name="departmentRef"
              placeholder={t("fieldDepartmentPlaceholder")}
              disabled={pending}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="msc-risk">{t("fieldRisk")}</FieldLabel>
            <Input id="msc-risk" name="riskCategory" disabled={pending} />
          </Field>
          <div className="flex flex-col gap-2 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="requiresMachineSafety"
                defaultChecked
                disabled={pending}
              />
              {t("requiresMachineSafety")}
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="requiresPpeTraining"
                defaultChecked
                disabled={pending}
              />
              {t("requiresPpeTraining")}
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="requiresPpeAcknowledgment"
                disabled={pending}
              />
              {t("requiresPpeAcknowledgment")}
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="requiresChemicalHandling"
                disabled={pending}
              />
              {t("requiresChemicalHandling")}
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="requiresFireSafety"
                disabled={pending}
              />
              {t("requiresFireSafety")}
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="requiresErgonomics"
                disabled={pending}
              />
              {t("requiresErgonomics")}
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="requiresWorkplaceHazard"
                disabled={pending}
              />
              {t("requiresWorkplaceHazard")}
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="requiresSafetyCertification"
                defaultChecked
                disabled={pending}
              />
              {t("requiresSafetyCertification")}
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
