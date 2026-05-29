"use client"

import { useActionState } from "react"
import { useTranslations } from "next-intl"
import { Loader2 } from "lucide-react"

import { Button } from "@afenda/ui/button"

import { applyGpgGradeMovementDraftAction } from "../actions/gpg-movement.actions"
import type { ApplyGpgGradeMovementFormState } from "@afenda/feature-hrm-core/shared"

export function GpgGradeMovementApplyTrailing({
  movementId,
  disabled,
}: {
  movementId: string
  disabled?: boolean
}) {
  const t = useTranslations("Erp.Hrm.governmentPayGrades")
  const [state, formAction, pending] = useActionState<
    ApplyGpgGradeMovementFormState | undefined,
    FormData
  >(applyGpgGradeMovementDraftAction, undefined)

  const error = state && !state.ok ? state.errors?.form : null

  return (
    <div className="flex flex-col items-end gap-1">
      <form action={formAction}>
        <input type="hidden" name="movementId" value={movementId} />
        <Button type="submit" size="sm" disabled={disabled || pending}>
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              {t("applyingMovement")}
            </>
          ) : (
            t("applyGradeMovement")
          )}
        </Button>
      </form>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}
