"use client"

import { useActionState } from "react"
import { useTranslations } from "next-intl"
import { Loader2 } from "lucide-react"

import { Badge } from "@afenda/ui/badge"
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

import { submitFhcPermitRenewalFormAction } from "../actions/fhc-renewal.actions"
import type { SubmitFhcPermitRenewalFormState } from "@afenda/feature-hrm-core/shared"
import type { FhcEmployeeObligationRow } from "../data/fhc.types.shared"
import type { HrmFhcRenewalState } from "../schemas/fhc-workflow-state.shared"

const RENEWAL_OPEN: ReadonlySet<HrmFhcRenewalState> = new Set([
  "pending",
  "submitted",
])

type FhcRenewalDialogProps = {
  obligation: FhcEmployeeObligationRow
}

function FhcRenewalDialogForm({
  obligation,
  renewalState,
}: {
  obligation: FhcEmployeeObligationRow
  renewalState: HrmFhcRenewalState
}) {
  const t = useTranslations("Erp.Hrm.foodHandlerCompliance")
  const [state, formAction, pending] = useActionState<
    SubmitFhcPermitRenewalFormState | undefined,
    FormData
  >(submitFhcPermitRenewalFormAction, undefined)
  const error = state && !state.ok ? state.errors : null
  const readOnly = renewalState === "submitted"

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="secondary">
          {readOnly ? t("renewalSubmitted") : t("submitRenewal")}
          <Badge variant="outline" className="ml-1">
            {t(`renewalStateLabels.${renewalState}`)}
          </Badge>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("submitRenewalTitle")}</DialogTitle>
          <DialogDescription>
            {readOnly
              ? t("renewalAwaitingVerification")
              : t("submitRenewalDescription")}
          </DialogDescription>
        </DialogHeader>
        {readOnly ? null : (
          <form action={formAction} className="flex flex-col gap-4">
            <input type="hidden" name="obligationId" value={obligation.id} />
            <Field>
              <FieldLabel htmlFor={`renewal-number-${obligation.id}`}>
                {t("fieldPermitNumber")}
              </FieldLabel>
              <Input
                id={`renewal-number-${obligation.id}`}
                name="permitNumber"
                required
                disabled={pending}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`renewal-authority-${obligation.id}`}>
                {t("fieldIssuingAuthority")}
              </FieldLabel>
              <Input
                id={`renewal-authority-${obligation.id}`}
                name="issuingAuthority"
                disabled={pending}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`renewal-issue-${obligation.id}`}>
                {t("fieldIssueDate")}
              </FieldLabel>
              <Input
                id={`renewal-issue-${obligation.id}`}
                name="issueDate"
                type="date"
                disabled={pending}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`renewal-expiry-${obligation.id}`}>
                {t("fieldExpiryDate")}
              </FieldLabel>
              <Input
                id={`renewal-expiry-${obligation.id}`}
                name="expiryDate"
                type="date"
                disabled={pending}
              />
              {error?.form ? <FieldError>{error.form}</FieldError> : null}
            </Field>
            <Button type="submit" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  {t("saving")}
                </>
              ) : (
                t("saveRenewal")
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function FhcRenewalDialog({ obligation }: FhcRenewalDialogProps) {
  const renewalState =
    obligation.permitRenewalState as HrmFhcRenewalState | null

  if (
    !obligation.permitId ||
    !renewalState ||
    !RENEWAL_OPEN.has(renewalState)
  ) {
    return null
  }

  return (
    <FhcRenewalDialogForm obligation={obligation} renewalState={renewalState} />
  )
}
