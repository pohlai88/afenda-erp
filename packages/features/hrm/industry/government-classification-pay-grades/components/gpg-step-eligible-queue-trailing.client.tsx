"use client"

import { useActionState } from "react"
import { useTranslations } from "next-intl"
import { Loader2 } from "lucide-react"

import { Button } from "@afenda/ui/button"

import { createGpgStepIncreaseEventAction } from "../actions/gpg-step-increase.actions"
import type { CreateGpgStepIncreaseEventFormState } from "../../../_core/shared"
import type { GpgStepEligibleRow } from "../data/gpg.types.shared"

export function GpgStepEligibleQueueTrailing({
  row,
  disabled,
}: {
  row: GpgStepEligibleRow
  disabled?: boolean
}) {
  const t = useTranslations("Erp.Hrm.governmentPayGrades")
  const [state, formAction, pending] = useActionState<
    CreateGpgStepIncreaseEventFormState | undefined,
    FormData
  >(createGpgStepIncreaseEventAction, undefined)

  const error = state && !state.ok ? state.errors?.form : null

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="assignmentId" value={row.assignmentId} />
      <input type="hidden" name="ruleId" value={row.ruleId} />
      <Button
        type="submit"
        size="sm"
        variant="outline"
        disabled={disabled || pending}
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          t("queueStepIncrease")
        )}
      </Button>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </form>
  )
}
