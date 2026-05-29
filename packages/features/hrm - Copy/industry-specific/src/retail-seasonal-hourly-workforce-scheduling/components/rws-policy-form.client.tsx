"use client"

import { useActionState } from "react"
import { useTranslations } from "next-intl"
import { Loader2 } from "lucide-react"

import { Button } from "@afenda/ui/button"
import { Field, FieldError, FieldLabel } from "@afenda/ui/field"
import { Input } from "@afenda/ui/input"

import { updateRwsRetailPolicyAction } from "../actions/rws-policy.actions"
import type { RwsRetailSchedulingPolicyRow } from "../data/rws.types.shared"
import type { UpdateRwsRetailPolicyFormState } from "@afenda/feature-hrm-core/shared"

type RwsPolicyFormProps = {
  policy: RwsRetailSchedulingPolicyRow
}

export function RwsPolicyForm({ policy }: RwsPolicyFormProps) {
  const t = useTranslations("Erp.Hrm.retailScheduling")
  const [state, formAction, pending] = useActionState<
    UpdateRwsRetailPolicyFormState | undefined,
    FormData
  >(updateRwsRetailPolicyAction, undefined)

  const error = state && !state.ok ? state.errors : null

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      <Field>
        <FieldLabel htmlFor="maxDailyHours">{t("fieldMaxDailyHours")}</FieldLabel>
        <Input
          id="maxDailyHours"
          name="maxDailyHours"
          type="number"
          defaultValue={policy.maxDailyHours ?? ""}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="maxWeeklyHours">
          {t("fieldMaxWeeklyHours")}
        </FieldLabel>
        <Input
          id="maxWeeklyHours"
          name="maxWeeklyHours"
          type="number"
          defaultValue={policy.maxWeeklyHours ?? ""}
        />
      </Field>
      <label className="flex items-center gap-2 text-sm sm:col-span-2">
        <input
          type="checkbox"
          name="peakSeasonEnabled"
          value="true"
          defaultChecked={policy.peakSeasonEnabled}
        />
        {t("fieldPeakSeasonEnabled")}
      </label>
      <label className="flex items-center gap-2 text-sm sm:col-span-2">
        <input
          type="checkbox"
          name="holidayRuleEnabled"
          value="true"
          defaultChecked={policy.holidayRuleEnabled}
        />
        {t("fieldHolidayRuleEnabled")}
      </label>
      {error?.form ? <FieldError className="sm:col-span-2">{error.form}</FieldError> : null}
      <Button type="submit" disabled={pending} className="sm:col-span-2 w-fit">
        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
        {t("savePolicy")}
      </Button>
    </form>
  )
}
