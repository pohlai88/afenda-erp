"use client"

import { useActionState } from "react"
import { useTranslations } from "next-intl"
import { Loader2 } from "lucide-react"

import { Button } from "@afenda/ui/button"

import { emitMscExpiryAlertsFormAction } from "../actions/msc-expiry-alert.actions"
import type { EmitMscExpiryAlertsFormState } from "../data/msc-form-state.shared"

export function MscExpiryAlertsEmitButton() {
  const t = useTranslations("Erp.Hrm.manufacturingSafety")
  const [state, formAction, pending] = useActionState<
    EmitMscExpiryAlertsFormState | undefined,
    FormData
  >(emitMscExpiryAlertsFormAction, undefined)

  const success =
    state?.ok &&
    (state.emittedInApp > 0 || state.emittedEmail > 0 || state.skipped >= 0)

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            {t("emittingExpiryAlerts")}
          </>
        ) : (
          t("emitExpiryAlerts")
        )}
      </Button>
      {state && !state.ok && state.errors?.form ? (
        <p className="text-sm text-destructive">{state.errors.form}</p>
      ) : null}
      {success ? (
        <p className="text-sm text-muted-foreground">
          {t("emitExpiryAlertsSuccess", {
            inApp: state.emittedInApp,
            email: state.emittedEmail,
            skipped: state.skipped,
          })}
        </p>
      ) : null}
    </form>
  )
}
