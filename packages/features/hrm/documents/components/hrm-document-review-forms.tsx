"use client"

import { useActionState, useState } from "react"
import { useTranslations } from "next-intl"
import { Loader2 } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@afenda/ui/alert"
import { Button } from "@afenda/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@afenda/ui/dialog"
import { Field, FieldError, FieldLabel } from "@afenda/ui/field"
import { Input } from "@afenda/ui/input"

import {
  rejectDocumentAction,
  verifyDocumentAction,
} from "../../employees/client"

import type { HrmDocumentMutationFormState } from "../../_core/shared"

type ReviewFormProps = {
  readonly orgSlug: string
  readonly documentId: string
}

export function HrmDocumentVerifyForm({
  orgSlug,
  documentId,
}: ReviewFormProps) {
  const t = useTranslations("Erp.Hrm.documents.review")
  const [state, formAction, pending] = useActionState(
    verifyDocumentAction,
    undefined
  )

  return (
    <form action={formAction} className="inline-flex">
      <input type="hidden" name="orgSlug" value={orgSlug} />
      <input type="hidden" name="documentId" value={documentId} />
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : t("verify")}
      </Button>
      {state && !state.ok && state.errors.form ? (
        <span className="sr-only">{state.errors.form}</span>
      ) : null}
    </form>
  )
}

export function HrmDocumentRejectForm({
  orgSlug,
  documentId,
}: ReviewFormProps) {
  const t = useTranslations("Erp.Hrm.documents.review")
  const [open, setOpen] = useState(false)
  const [state, formAction, pending] = useActionState<
    HrmDocumentMutationFormState | undefined,
    FormData
  >(rejectDocumentAction, undefined)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="ghost">
          {t("reject")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("rejectTitle")}</DialogTitle>
          <DialogDescription>{t("rejectDescription")}</DialogDescription>
        </DialogHeader>
        {state?.ok ? (
          <div className="flex flex-col gap-4">
            <Alert>
              <AlertTitle>{t("rejectSuccess")}</AlertTitle>
            </Alert>
            <Button type="button" onClick={() => setOpen(false)}>
              {t("dialogClose")}
            </Button>
          </div>
        ) : (
          <form action={formAction} className="flex flex-col gap-4">
            <input type="hidden" name="orgSlug" value={orgSlug} />
            <input type="hidden" name="documentId" value={documentId} />
            {state && !state.ok && state.errors.form ? (
              <Alert variant="destructive">
                <AlertTitle>{t("errorTitle")}</AlertTitle>
                <AlertDescription>{state.errors.form}</AlertDescription>
              </Alert>
            ) : null}
            <Field>
              <FieldLabel htmlFor={`reject-reason-${documentId}`}>
                {t("fieldRejectionReason")}
              </FieldLabel>
              <Input
                id={`reject-reason-${documentId}`}
                name="rejectionReason"
                required
                autoComplete="off"
              />
              {state &&
              !state.ok &&
              "rejectionReason" in state.errors &&
              state.errors.rejectionReason ? (
                <FieldError>{state.errors.rejectionReason}</FieldError>
              ) : null}
            </Field>
            <Button type="submit" variant="destructive" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {t("rejecting")}
                </>
              ) : (
                t("rejectSubmit")
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
