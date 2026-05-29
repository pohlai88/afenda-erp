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
  recordMscCertificationFormAction,
  recordMscTrainingFormAction,
} from "../actions/msc-record.actions"
import type {
  RecordMscCertificationFormState,
  RecordMscTrainingFormState,
} from "../data/msc-form-state.shared"
import type { MscEmployeeObligationRow } from "../data/msc.types.shared"
import { HRM_MSC_TRAINING_CATEGORIES } from "../schemas/msc-workflow-state.shared"

const SELECT_CLASS =
  "h-9 w-full rounded border border-border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"

function MscTrainingRecordDialog({
  obligation,
}: {
  obligation: MscEmployeeObligationRow
}) {
  const t = useTranslations("Erp.Hrm.manufacturingSafety")
  const [state, formAction, pending] = useActionState<
    RecordMscTrainingFormState | undefined,
    FormData
  >(recordMscTrainingFormAction, undefined)
  const error = state && !state.ok ? state.errors : null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          {t("recordTraining")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("recordTrainingTitle")}</DialogTitle>
          <DialogDescription>{obligation.employeeLabel}</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="obligationId" value={obligation.id} />
          <Field>
            <FieldLabel htmlFor={`msc-training-cat-${obligation.id}`}>
              {t("fieldTrainingCategory")}
            </FieldLabel>
            <select
              id={`msc-training-cat-${obligation.id}`}
              name="trainingCategory"
              className={SELECT_CLASS}
              required
              disabled={pending}
            >
              {HRM_MSC_TRAINING_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {t(`trainingCategoryLabels.${category}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor={`msc-training-date-${obligation.id}`}>
              {t("fieldCompletedAt")}
            </FieldLabel>
            <Input
              id={`msc-training-date-${obligation.id}`}
              name="completedAt"
              type="date"
              required
              disabled={pending}
            />
          </Field>
          <Field className="flex flex-row items-center gap-2">
            <input
              type="checkbox"
              id={`msc-training-ppe-${obligation.id}`}
              name="ppeAcknowledged"
              disabled={pending}
            />
            <FieldLabel
              htmlFor={`msc-training-ppe-${obligation.id}`}
              className="font-normal"
            >
              {t("fieldPpeAcknowledged")}
            </FieldLabel>
          </Field>
          {error?.form ? <FieldError>{error.form}</FieldError> : null}
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

function MscCertificationRecordDialog({
  obligation,
}: {
  obligation: MscEmployeeObligationRow
}) {
  const t = useTranslations("Erp.Hrm.manufacturingSafety")
  const [state, formAction, pending] = useActionState<
    RecordMscCertificationFormState | undefined,
    FormData
  >(recordMscCertificationFormAction, undefined)
  const error = state && !state.ok ? state.errors : null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          {t("recordCertification")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("recordCertificationTitle")}</DialogTitle>
          <DialogDescription>{obligation.employeeLabel}</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="obligationId" value={obligation.id} />
          <Field>
            <FieldLabel htmlFor={`msc-cert-type-${obligation.id}`}>
              {t("colCertType")}
            </FieldLabel>
            <Input
              id={`msc-cert-type-${obligation.id}`}
              name="certificationType"
              defaultValue="general"
              disabled={pending}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`msc-cert-ref-${obligation.id}`}>
              {t("fieldCertificateRef")}
            </FieldLabel>
            <Input
              id={`msc-cert-ref-${obligation.id}`}
              name="certificateRef"
              disabled={pending}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`msc-cert-issue-${obligation.id}`}>
              {t("colIssueDate")}
            </FieldLabel>
            <Input
              id={`msc-cert-issue-${obligation.id}`}
              name="issueDate"
              type="date"
              disabled={pending}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`msc-cert-expiry-${obligation.id}`}>
              {t("colExpiryDate")}
            </FieldLabel>
            <Input
              id={`msc-cert-expiry-${obligation.id}`}
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
              t("saveCertification")
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function MscObligationRecordsTrailing({
  obligation,
}: {
  obligation: MscEmployeeObligationRow
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-1">
      <MscTrainingRecordDialog obligation={obligation} />
      <MscCertificationRecordDialog obligation={obligation} />
    </div>
  )
}
