"use client"

import { useActionState } from "react"
import { useTranslations } from "next-intl"
import { BellRing, Loader2 } from "lucide-react"

import { Button } from "@afenda/ui/button"

import { emitFhcExpiryAlertsFormAction } from "../actions/fhc-expiry-alert.actions"
import type { EmitFhcExpiryAlertsFormState } from "@afenda/feature-hrm-core/shared"

export function FhcExpiryAlertsEmitButton() {
  const t = useTranslations("Erp.Hrm.foodHandlerCompliance")
  const [state, formAction, pending] = useActionState<
    EmitFhcExpiryAlertsFormState | undefined,
    FormData
  >(emitFhcExpiryAlertsFormAction, undefined)

  const summary =
    state && state.ok
      ? t("expiryAlertsEmitSuccess", {
          emittedInApp: state.emittedInApp,
          emittedEmail: state.emittedEmail,
          skipped: state.skipped,
        })
      : state && !state.ok
        ? state.errors.form
        : null

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            {t("emittingExpiryAlerts")}
          </>
        ) : (
          <>
            <BellRing className="size-4" aria-hidden />
            {t("emitExpiryAlerts")}
          </>
        )}
      </Button>
      {summary ? (
        <p className="max-w-xs text-right text-xs text-muted-foreground">
          {summary}
        </p>
      ) : null}
    </form>
  )
}
