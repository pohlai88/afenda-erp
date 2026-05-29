"use client"

import { useActionState } from "react"
import { useTranslations } from "next-intl"
import { Loader2 } from "lucide-react"

import { Button } from "@afenda/ui/button"
import { FieldError } from "@afenda/ui/field"

import { publishGpgSalaryTableVersionAction } from "../actions/gpg-master.actions"
import type { PublishGpgSalaryTableVersionFormState } from "@afenda/feature-hrm-core/shared"

export function GpgSalaryTablePublishButton({
  tableVersionId,
}: {
  tableVersionId: string
}) {
  const t = useTranslations("Erp.Hrm.governmentPayGrades")
  const [state, formAction, pending] = useActionState<
    PublishGpgSalaryTableVersionFormState | undefined,
    FormData
  >(publishGpgSalaryTableVersionAction, undefined)

  const error = state && !state.ok ? state.errors : null

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="tableVersionId" value={tableVersionId} />
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            {t("publishing")}
          </>
        ) : (
          t("publishSalaryTable")
        )}
      </Button>
      {error?.form ? <FieldError>{error.form}</FieldError> : null}
    </form>
  )
}
