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

import { submitFhcHealthRenewalFormAction } from "../actions/fhc-renewal.actions"
import type { SubmitFhcHealthRenewalFormState } from "@afenda/feature-hrm-core/shared"
import type { FhcEmployeeObligationRow } from "../data/fhc.types.shared"
import type { HrmFhcRenewalState } from "../schemas/fhc-workflow-state.shared"

const RENEWAL_OPEN: ReadonlySet<HrmFhcRenewalState> = new Set([
  "pending",
  "submitted",
])

type FhcHealthRenewalDialogProps = {
  obligation: FhcEmployeeObligationRow
  canAudit: boolean
}

function FhcHealthRenewalDialogForm({
  obligation,
  renewalState,
  canAudit,
}: {
  obligation: FhcEmployeeObligationRow
  renewalState: HrmFhcRenewalState
  canAudit: boolean
}) {
  const t = useTranslations("Erp.Hrm.foodHandlerCompliance")
  const [state, formAction, pending] = useActionState<
    SubmitFhcHealthRenewalFormState | undefined,
    FormData
  >(submitFhcHealthRenewalFormAction, undefined)
  const error = state && !state.ok ? state.errors : null
  const readOnly = renewalState === "submitted"

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="secondary">
          {readOnly ? t("renewalSubmitted") : t("submitHealthRenewal")}
          <Badge variant="outline" className="ml-1">
            {t(`renewalStateLabels.${renewalState}`)}
          </Badge>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("submitHealthRenewalTitle")}</DialogTitle>
          <DialogDescription>
            {readOnly
              ? t("renewalAwaitingVerification")
              : t("submitHealthRenewalDescription")}
          </DialogDescription>
        </DialogHeader>
        {readOnly ? null : (
          <form action={formAction} className="flex flex-col gap-4">
            <input type="hidden" name="obligationId" value={obligation.id} />
            {canAudit ? (
              <Field>
                <FieldLabel htmlFor={`health-renewal-ref-${obligation.id}`}>
                  {t("fieldCertificateRef")}
                </FieldLabel>
                <Input
                  id={`health-renewal-ref-${obligation.id}`}
                  name="certificateRef"
                  disabled={pending}
                />
              </Field>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t("healthCertificateRefRestricted")}
              </p>
            )}
            <Field>
              <FieldLabel htmlFor={`health-renewal-issued-${obligation.id}`}>
                {t("fieldIssueDate")}
              </FieldLabel>
              <Input
                id={`health-renewal-issued-${obligation.id}`}
                name="issuedAt"
                type="date"
                disabled={pending}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`health-renewal-expires-${obligation.id}`}>
                {t("fieldExpiryDate")}
              </FieldLabel>
              <Input
                id={`health-renewal-expires-${obligation.id}`}
                name="expiresAt"
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
                t("saveHealthRenewal")
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function FhcHealthRenewalDialog({
  obligation,
  canAudit,
}: FhcHealthRenewalDialogProps) {
  const renewalState =
    obligation.healthRenewalState as HrmFhcRenewalState | null

  if (
    !obligation.healthCertificateId ||
    !renewalState ||
    !RENEWAL_OPEN.has(renewalState)
  ) {
    return null
  }

  return (
    <FhcHealthRenewalDialogForm
      obligation={obligation}
      renewalState={renewalState}
      canAudit={canAudit}
    />
  )
}
