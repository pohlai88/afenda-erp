"use client"

import { useActionState } from "react"
import { useTranslations } from "next-intl"
import { Loader2 } from "lucide-react"

import { Button } from "@afenda/ui/button"

import { processGpgStepIncreaseAutoBatchAction } from "../actions/gpg-step-increase.actions"
import type { ProcessGpgStepIncreaseAutoBatchFormState } from "../../../_core/shared"

export function GpgStepIncreaseAutoBatchButton() {
  const t = useTranslations("Erp.Hrm.governmentPayGrades")
  const [state, formAction, pending] = useActionState<
    ProcessGpgStepIncreaseAutoBatchFormState | undefined,
    FormData
  >(processGpgStepIncreaseAutoBatchAction, undefined)

  const message =
    state?.ok === true
      ? t("autoBatchResult", {
          processed: state.processedCount,
          skipped: state.skippedCount,
        })
      : state && !state.ok
        ? state.errors?.form
        : null

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="confirm" value="yes" />
      <Button type="submit" size="sm" variant="secondary" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            {t("processing")}
          </>
        ) : (
          t("runAutoStepBatch")
        )}
      </Button>
      {message ? (
        <p
          className={
            state?.ok
              ? "text-xs text-muted-foreground"
              : "text-xs text-destructive"
          }
        >
          {message}
        </p>
      ) : null}
    </form>
  )
}
