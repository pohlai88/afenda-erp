"use client"

import { useActionState, useId } from "react"
import { useTranslations } from "next-intl"
import { Loader2 } from "lucide-react"

import { Alert, AlertDescription } from "@afenda/ui/alert"
import { Button } from "@afenda/ui/button"
import { Field, FieldError, FieldLabel } from "@afenda/ui/field"

import { useFormSuccess } from "@afenda/feature-hrm-core/client"

import {
  requestLeaveClarificationAction,
  type LeaveApprovalFormState,
} from "@afenda/feature-hrm-time-attendance/client"

type LeaveClarificationFormProps = {
  requestId: string
  onSuccess?: () => void
}

export function LeaveClarificationForm({
  requestId,
  onSuccess,
}: LeaveClarificationFormProps) {
  const t = useTranslations("Erp.Hrm.leave")
  const [state, formAction, pending] = useActionState<
    LeaveApprovalFormState | undefined,
    FormData
  >(requestLeaveClarificationAction, undefined)

  const noteId = useId()
  useFormSuccess(state, onSuccess)

  const error = state && !state.ok ? state.errors : null

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="requestId" value={requestId} />

      {error?.form ? (
        <Alert variant="destructive">
          <AlertDescription>{error.form}</AlertDescription>
        </Alert>
      ) : null}

      <Field data-invalid={error?.clarificationNote ? true : undefined}>
        <FieldLabel htmlFor={noteId}>{t("clarificationNoteLabel")}</FieldLabel>
        <textarea
          id={noteId}
          name="clarificationNote"
          rows={3}
          maxLength={1000}
          required
          placeholder={t("clarificationNotePlaceholder")}
          className="min-h-[72px] w-full rounded border border-border bg-background px-2 py-1.5 text-sm focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
          aria-invalid={Boolean(error?.clarificationNote)}
        />
        {error?.clarificationNote ? (
          <FieldError>{error.clarificationNote}</FieldError>
        ) : null}
      </Field>

      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? (
          <>
            <Loader2
              className="size-4 animate-spin"
              data-icon="inline-start"
              aria-hidden
            />
            {t("requestingClarification")}
          </>
        ) : (
          t("requestClarification")
        )}
      </Button>
    </form>
  )
}
