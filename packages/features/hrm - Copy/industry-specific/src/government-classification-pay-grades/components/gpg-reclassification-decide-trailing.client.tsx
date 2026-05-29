"use client"

import { useActionState } from "react"
import { useTranslations } from "next-intl"
import { Loader2 } from "lucide-react"

import { Button } from "@afenda/ui/button"

import { decideGpgReclassificationRequestAction } from "../actions/gpg-reclassification.actions"
import type { DecideGpgReclassificationRequestFormState } from "@afenda/feature-hrm-core/shared"

export function GpgReclassificationDecideTrailing({
  requestId,
  disabled,
}: {
  requestId: string
  disabled?: boolean
}) {
  const t = useTranslations("Erp.Hrm.governmentPayGrades")
  const [state, formAction, pending] = useActionState<
    DecideGpgReclassificationRequestFormState | undefined,
    FormData
  >(decideGpgReclassificationRequestAction, undefined)

  const error = state && !state.ok ? state.errors?.form : null

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <form action={formAction}>
        <input type="hidden" name="requestId" value={requestId} />
        <input type="hidden" name="decision" value="approved" />
        <Button type="submit" size="sm" disabled={disabled || pending}>
          {pending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            t("approveReclassification")
          )}
        </Button>
      </form>
      <form action={formAction}>
        <input type="hidden" name="requestId" value={requestId} />
        <input type="hidden" name="decision" value="rejected" />
        <Button
          type="submit"
          size="sm"
          variant="outline"
          disabled={disabled || pending}
        >
          {t("rejectReclassification")}
        </Button>
      </form>
      {error ? (
        <p className="w-full text-xs text-destructive">{error}</p>
      ) : null}
    </div>
  )
}
