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

import { submitFhcPermitFormAction } from "../actions/fhc-record.actions"
import type { SubmitFhcPermitFormState } from "../../../_core/shared"
import type { FhcEmployeeObligationRow } from "../data/fhc.types.shared"

type FhcObligationPermitTrailingButtonProps = {
  obligation: FhcEmployeeObligationRow
}

export function FhcObligationPermitTrailingButton({
  obligation,
}: FhcObligationPermitTrailingButtonProps) {
  const t = useTranslations("Erp.Hrm.foodHandlerCompliance")
  const [state, formAction, pending] = useActionState<
    SubmitFhcPermitFormState | undefined,
    FormData
  >(submitFhcPermitFormAction, undefined)

  const error = state && !state.ok ? state.errors : null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          {t("recordPermitRow")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("submitPermitTitle")}</DialogTitle>
          <DialogDescription>
            {obligation.employeeLabel}
            {obligation.employeeNumber ? ` · ${obligation.employeeNumber}` : ""}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="obligationId" value={obligation.id} />
          <Field>
            <FieldLabel htmlFor="fhc-permit-number-row">
              {t("fieldPermitNumber")}
            </FieldLabel>
            <Input
              id="fhc-permit-number-row"
              name="permitNumber"
              required
              disabled={pending}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="fhc-authority-row">
              {t("fieldIssuingAuthority")}
            </FieldLabel>
            <Input
              id="fhc-authority-row"
              name="issuingAuthority"
              disabled={pending}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="fhc-issue-row">
              {t("fieldIssueDate")}
            </FieldLabel>
            <Input
              id="fhc-issue-row"
              name="issueDate"
              type="date"
              disabled={pending}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="fhc-expiry-row">
              {t("fieldExpiryDate")}
            </FieldLabel>
            <Input
              id="fhc-expiry-row"
              name="expiryDate"
              type="date"
              disabled={pending}
            />
          </Field>
          {error?.form ? <FieldError>{error.form}</FieldError> : null}
          <Button type="submit" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                {t("saving")}
              </>
            ) : (
              t("savePermit")
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
