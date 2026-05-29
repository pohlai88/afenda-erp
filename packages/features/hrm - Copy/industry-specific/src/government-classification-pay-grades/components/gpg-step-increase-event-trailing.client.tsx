"use client"

import { useActionState } from "react"
import { useTranslations } from "next-intl"
import { Loader2 } from "lucide-react"

import { Button } from "@afenda/ui/button"

import { decideGpgStepIncreaseEventAction } from "../actions/gpg-step-increase.actions"
import type { DecideGpgStepIncreaseEventFormState } from "@afenda/feature-hrm-core/shared"

export function GpgStepIncreaseEventTrailing({
  eventId,
  disabled,
}: {
  eventId: string
  disabled?: boolean
}) {
  const t = useTranslations("Erp.Hrm.governmentPayGrades")
  const [state, formAction, pending] = useActionState<
    DecideGpgStepIncreaseEventFormState | undefined,
    FormData
  >(decideGpgStepIncreaseEventAction, undefined)

  const error = state && !state.ok ? state.errors?.form : null

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <form action={formAction}>
        <input type="hidden" name="eventId" value={eventId} />
        <input type="hidden" name="decision" value="approved" />
        <Button type="submit" size="sm" disabled={disabled || pending}>
          {pending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            t("approveStepIncrease")
          )}
        </Button>
      </form>
      <form action={formAction}>
        <input type="hidden" name="eventId" value={eventId} />
        <input type="hidden" name="decision" value="rejected" />
        <Button
          type="submit"
          size="sm"
          variant="outline"
          disabled={disabled || pending}
        >
          {t("rejectStepIncrease")}
        </Button>
      </form>
      {error ? (
        <p className="w-full text-xs text-destructive">{error}</p>
      ) : null}
    </div>
  )
}
