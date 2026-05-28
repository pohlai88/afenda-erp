"use client"

import { useActionState, useId } from "react"
import { useTranslations } from "next-intl"
import { Loader2 } from "lucide-react"

import { Alert, AlertDescription } from "@afenda/ui/alert"
import { Button } from "@afenda/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@afenda/ui/field"
import { Input } from "@afenda/ui/input"
import { submitEmployeePortalRequestAdvance } from "../../employees/client"
import type { PortalAdvanceFormState } from "../../_core/shared"

import { useFormSuccess } from "../../_core/client"

type EmployeePortalAdvanceRequestFormProps = {
  portalSlug: string
  onSuccess?: () => void
}

export function EmployeePortalAdvanceRequestForm({
  portalSlug,
  onSuccess,
}: EmployeePortalAdvanceRequestFormProps) {
  const t = useTranslations("Erp.Hrm.portalAdvances")
  const [state, formAction, pending] = useActionState<
    PortalAdvanceFormState | undefined,
    FormData
  >(submitEmployeePortalRequestAdvance, undefined)

  const amountId = useId()
  const reasonId = useId()
  const installmentCountId = useId()
  const firstPeriodId = useId()
  useFormSuccess(state, onSuccess)

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="portalSlug" value={portalSlug} />

      {state?.ok ? (
        <Alert>
          <AlertDescription>{t("formSuccess")}</AlertDescription>
        </Alert>
      ) : null}

      {state && !state.ok && state.errors.form ? (
        <Alert variant="destructive">
          <AlertDescription>{state.errors.form}</AlertDescription>
        </Alert>
      ) : null}

      <Field>
        <FieldLabel htmlFor={amountId}>{t("formAmount")}</FieldLabel>
        <Input
          id={amountId}
          name="amount"
          type="text"
          inputMode="decimal"
          required
          disabled={pending}
          placeholder="0.00"
        />
        <FieldDescription>{t("formAmountHelp")}</FieldDescription>
        {state && !state.ok && state.errors.amount ? (
          <FieldError>{state.errors.amount}</FieldError>
        ) : null}
      </Field>

      <Field>
        <FieldLabel htmlFor={reasonId}>{t("formReason")}</FieldLabel>
        <Input
          id={reasonId}
          name="reason"
          type="text"
          disabled={pending}
          maxLength={2000}
        />
      </Field>

      <Field>
        <FieldLabel htmlFor={installmentCountId}>
          {t("formInstallmentCount")}
        </FieldLabel>
        <Input
          id={installmentCountId}
          name="installmentCount"
          type="number"
          min={1}
          max={12}
          disabled={pending}
        />
        <FieldDescription>{t("formInstallmentCountHelp")}</FieldDescription>
        {state && !state.ok && state.errors.installmentCount ? (
          <FieldError>{state.errors.installmentCount}</FieldError>
        ) : null}
      </Field>

      <Field>
        <FieldLabel htmlFor={firstPeriodId}>{t("formFirstPeriod")}</FieldLabel>
        <Input
          id={firstPeriodId}
          name="firstPeriodEndIso"
          type="date"
          disabled={pending}
        />
        <FieldDescription>{t("formFirstPeriodHelp")}</FieldDescription>
        {state && !state.ok && state.errors.firstPeriodEndIso ? (
          <FieldError>{state.errors.firstPeriodEndIso}</FieldError>
        ) : null}
      </Field>

      <Button type="submit" className="min-h-11" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            {t("formSubmitting")}
          </>
        ) : (
          t("formSubmit")
        )}
      </Button>
    </form>
  )
}
