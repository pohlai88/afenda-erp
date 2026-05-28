"use client"

import { useActionState } from "react"
import { useTranslations } from "next-intl"
import { Loader2 } from "lucide-react"

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
  rejectFhcVerificationAction,
  verifyFhcVerificationAction,
} from "../actions/fhc-verification.actions"
import type { FhcVerificationActionState } from "../../../_core/shared"
import type { FhcVerificationQueueRow } from "../data/fhc-verification.server"

type FhcVerificationTrailingActionsProps = {
  row: FhcVerificationQueueRow
}

export function FhcVerificationTrailingActions({
  row,
}: FhcVerificationTrailingActionsProps) {
  const t = useTranslations("Erp.Hrm.foodHandlerCompliance")

  const [verifyState, verifyAction, verifyPending] = useActionState<
    FhcVerificationActionState | undefined,
    FormData
  >(verifyFhcVerificationAction, undefined)

  const [rejectState, rejectAction, rejectPending] = useActionState<
    FhcVerificationActionState | undefined,
    FormData
  >(rejectFhcVerificationAction, undefined)

  const verifyError = verifyState && !verifyState.ok ? verifyState.errors : null
  const rejectError = rejectState && !rejectState.ok ? rejectState.errors : null

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <form action={verifyAction}>
        <input type="hidden" name="reviewId" value={row.id} />
        {row.obligationId ? (
          <input type="hidden" name="obligationId" value={row.obligationId} />
        ) : null}
        <Button
          type="submit"
          size="sm"
          variant="default"
          disabled={verifyPending}
        >
          {verifyPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            t("verifyReview")
          )}
        </Button>
      </form>
      {verifyError?.form ? (
        <span className="text-xs text-destructive">{verifyError.form}</span>
      ) : null}

      <Dialog>
        <DialogTrigger asChild>
          <Button type="button" size="sm" variant="outline">
            {t("rejectReview")}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("rejectReviewTitle")}</DialogTitle>
            <DialogDescription>
              {row.employeeLabel} · {row.subjectKind}
            </DialogDescription>
          </DialogHeader>
          <form action={rejectAction} className="flex flex-col gap-4">
            <input type="hidden" name="reviewId" value={row.id} />
            {row.obligationId ? (
              <input
                type="hidden"
                name="obligationId"
                value={row.obligationId}
              />
            ) : null}
            <Field>
              <FieldLabel htmlFor={`reject-reason-${row.id}`}>
                {t("fieldRejectReason")}
              </FieldLabel>
              <Input
                id={`reject-reason-${row.id}`}
                name="rejectedReason"
                required
                disabled={rejectPending}
              />
              {rejectError?.form ? (
                <FieldError>{rejectError.form}</FieldError>
              ) : null}
            </Field>
            <Button
              type="submit"
              variant="destructive"
              disabled={rejectPending}
            >
              {rejectPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  {t("saving")}
                </>
              ) : (
                t("confirmReject")
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
