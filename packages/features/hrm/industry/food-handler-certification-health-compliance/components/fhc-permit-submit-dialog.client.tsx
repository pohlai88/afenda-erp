"use client"

import { useActionState, useId } from "react"
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

const SELECT_CLASS =
  "h-9 w-full rounded border border-border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"

type FhcPermitSubmitDialogProps = {
  obligations: readonly FhcEmployeeObligationRow[]
}

export function FhcPermitSubmitDialog({
  obligations,
}: FhcPermitSubmitDialogProps) {
  const t = useTranslations("Erp.Hrm.foodHandlerCompliance")
  const obligationFieldId = useId()
  const [state, formAction, pending] = useActionState<
    SubmitFhcPermitFormState | undefined,
    FormData
  >(submitFhcPermitFormAction, undefined)

  const error = state && !state.ok ? state.errors : null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          {t("submitPermit")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("submitPermitTitle")}</DialogTitle>
          <DialogDescription>{t("submitPermitDescription")}</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor={obligationFieldId}>
              {t("fieldObligation")}
            </FieldLabel>
            <select
              id={obligationFieldId}
              name="obligationId"
              className={SELECT_CLASS}
              required
              disabled={pending}
            >
              <option value="">{t("fieldObligationPlaceholder")}</option>
              {obligations.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.employeeLabel}
                  {row.employeeNumber ? ` · ${row.employeeNumber}` : ""}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="fhc-permit-number">
              {t("fieldPermitNumber")}
            </FieldLabel>
            <Input
              id="fhc-permit-number"
              name="permitNumber"
              required
              disabled={pending}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="fhc-authority">
              {t("fieldIssuingAuthority")}
            </FieldLabel>
            <Input
              id="fhc-authority"
              name="issuingAuthority"
              disabled={pending}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="fhc-issue">{t("fieldIssueDate")}</FieldLabel>
            <Input
              id="fhc-issue"
              name="issueDate"
              type="date"
              disabled={pending}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="fhc-expiry">{t("fieldExpiryDate")}</FieldLabel>
            <Input
              id="fhc-expiry"
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
