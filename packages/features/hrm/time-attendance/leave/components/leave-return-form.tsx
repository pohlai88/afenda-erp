"use client"

import { useActionState, useId } from "react"
import { useTranslations } from "next-intl"
import { Loader2 } from "lucide-react"

import { Alert, AlertDescription } from "@afenda/ui/alert"
import { Button } from "@afenda/ui/button"
import { Field, FieldError, FieldLabel } from "@afenda/ui/field"

import { useFormSuccess } from "../../../_core/client"

import {
  returnLeaveAction,
  type LeaveApprovalFormState,
} from "../../../time-attendance/client"

type LeaveReturnFormProps = {
  requestId: string
  onSuccess?: () => void
}

export function LeaveReturnForm({
  requestId,
  onSuccess,
}: LeaveReturnFormProps) {
  const t = useTranslations("Erp.Hrm.leave")
  const [state, formAction, pending] = useActionState<
    LeaveApprovalFormState | undefined,
    FormData
  >(returnLeaveAction, undefined)

  const reasonId = useId()
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

      <Field data-invalid={error?.returnedReason ? true : undefined}>
        <FieldLabel htmlFor={reasonId}>{t("returnReasonLabel")}</FieldLabel>
        <textarea
          id={reasonId}
          name="returnedReason"
          rows={3}
          maxLength={1000}
          required
          placeholder={t("returnReasonPlaceholder")}
          className="min-h-[72px] w-full rounded border border-border bg-background px-2 py-1.5 text-sm focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
          aria-invalid={Boolean(error?.returnedReason)}
        />
        {error?.returnedReason ? (
          <FieldError>{error.returnedReason}</FieldError>
        ) : null}
      </Field>

      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? (
          <>
            <Loader2
              className="size-4 animate-spin"
              data-icon="inline-start"
              aria-hidden
            />
            {t("returning")}
          </>
        ) : (
          t("return")
        )}
      </Button>
    </form>
  )
}
