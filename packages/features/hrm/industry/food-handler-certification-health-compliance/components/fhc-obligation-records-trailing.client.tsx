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
  recordFhcHealthFormAction,
  recordFhcTrainingFormAction,
} from "../actions/fhc-record.actions"
import type {
  RecordFhcHealthFormState,
  RecordFhcTrainingFormState,
} from "../../../_core/shared"
import type {
  FhcEmployeeObligationRow,
  FhcEvidenceDocumentChoiceRow,
} from "../data/fhc.types.shared"
import { FhcEvidenceLinkDialog } from "./fhc-evidence-link-dialog.client"
import { FhcHealthRenewalDialog } from "./fhc-health-renewal-dialog.client"
import { FhcObligationPermitTrailingButton } from "./fhc-obligation-permit-trailing.client"
import { FhcRenewalDialog } from "./fhc-renewal-dialog.client"

type FhcObligationRecordsTrailingProps = {
  obligation: FhcEmployeeObligationRow
  canAudit: boolean
  documentChoices: readonly FhcEvidenceDocumentChoiceRow[]
}

function FhcTrainingRecordDialog({
  obligation,
  trainingType,
}: {
  obligation: FhcEmployeeObligationRow
  trainingType: "hygiene" | "allergen"
}) {
  const t = useTranslations("Erp.Hrm.foodHandlerCompliance")
  const [state, formAction, pending] = useActionState<
    RecordFhcTrainingFormState | undefined,
    FormData
  >(recordFhcTrainingFormAction, undefined)
  const error = state && !state.ok ? state.errors : null
  const labelKey =
    trainingType === "hygiene"
      ? "recordHygieneTraining"
      : "recordAllergenTraining"

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          {t(labelKey)}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t(labelKey)}</DialogTitle>
          <DialogDescription>{obligation.employeeLabel}</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="obligationId" value={obligation.id} />
          <input type="hidden" name="trainingType" value={trainingType} />
          <Field>
            <FieldLabel
              htmlFor={`training-date-${obligation.id}-${trainingType}`}
            >
              {t("fieldCompletedAt")}
            </FieldLabel>
            <Input
              id={`training-date-${obligation.id}-${trainingType}`}
              name="completedAt"
              type="date"
              required
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
              t("saveTraining")
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function FhcHealthRecordDialog({
  obligation,
  canAudit,
}: {
  obligation: FhcEmployeeObligationRow
  canAudit: boolean
}) {
  const t = useTranslations("Erp.Hrm.foodHandlerCompliance")
  const [state, formAction, pending] = useActionState<
    RecordFhcHealthFormState | undefined,
    FormData
  >(recordFhcHealthFormAction, undefined)
  const error = state && !state.ok ? state.errors : null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          {t("recordHealth")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("recordHealthTitle")}</DialogTitle>
          <DialogDescription>
            {canAudit
              ? obligation.employeeLabel
              : t("healthRecordRestrictedDescription")}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="obligationId" value={obligation.id} />
          {canAudit ? (
            <Field>
              <FieldLabel htmlFor={`health-ref-${obligation.id}`}>
                {t("fieldCertificateRef")}
              </FieldLabel>
              <Input
                id={`health-ref-${obligation.id}`}
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
            <FieldLabel htmlFor={`health-issued-${obligation.id}`}>
              {t("fieldIssueDate")}
            </FieldLabel>
            <Input
              id={`health-issued-${obligation.id}`}
              name="issuedAt"
              type="date"
              disabled={pending}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`health-expires-${obligation.id}`}>
              {t("fieldExpiryDate")}
            </FieldLabel>
            <Input
              id={`health-expires-${obligation.id}`}
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
              t("saveHealth")
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function FhcObligationRecordsTrailing({
  obligation,
  canAudit,
  documentChoices,
}: FhcObligationRecordsTrailingProps) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-1">
      {obligation.requiresPermit ? (
        <>
          <FhcObligationPermitTrailingButton obligation={obligation} />
          <FhcRenewalDialog obligation={obligation} />
          {obligation.permitId ? (
            <FhcEvidenceLinkDialog
              obligation={obligation}
              subjectKind="permit"
              linkCount={obligation.permitEvidenceCount}
              documentChoices={documentChoices}
            />
          ) : null}
        </>
      ) : null}
      {obligation.requiresHygieneTraining ? (
        <FhcTrainingRecordDialog
          obligation={obligation}
          trainingType="hygiene"
        />
      ) : null}
      {obligation.requiresAllergenTraining ? (
        <FhcTrainingRecordDialog
          obligation={obligation}
          trainingType="allergen"
        />
      ) : null}
      {obligation.requiresHealthCertificate ? (
        <>
          <FhcHealthRecordDialog obligation={obligation} canAudit={canAudit} />
          <FhcHealthRenewalDialog obligation={obligation} canAudit={canAudit} />
          {obligation.healthCertificateId ? (
            <FhcEvidenceLinkDialog
              obligation={obligation}
              subjectKind="health_certificate"
              linkCount={obligation.healthEvidenceCount}
              documentChoices={documentChoices}
            />
          ) : null}
        </>
      ) : null}
    </div>
  )
}
