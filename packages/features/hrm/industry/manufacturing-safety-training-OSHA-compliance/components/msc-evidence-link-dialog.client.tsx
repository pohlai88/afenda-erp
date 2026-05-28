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

import { linkMscEvidenceFormAction } from "../actions/msc-evidence.actions"
import type { LinkMscEvidenceFormState } from "../data/msc-form-state.shared"
import type { MscEmployeeObligationRow } from "../data/msc.types.shared"

const SELECT_CLASS =
  "h-9 w-full rounded border border-border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"

const SUBJECT_KINDS = [
  "obligation",
  "certification",
  "incident",
  "hazard_assessment",
] as const

export function MscEvidenceLinkDialog({
  obligations,
}: {
  obligations: readonly MscEmployeeObligationRow[]
}) {
  const t = useTranslations("Erp.Hrm.manufacturingSafety")
  const employeeFieldId = useId()
  const subjectKindFieldId = useId()
  const subjectIdFieldId = useId()
  const [state, formAction, pending] = useActionState<
    LinkMscEvidenceFormState | undefined,
    FormData
  >(linkMscEvidenceFormAction, undefined)
  const error = state && !state.ok ? state.errors : null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          {t("linkEvidence")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("linkEvidenceTitle")}</DialogTitle>
          <DialogDescription>{t("linkEvidenceDescription")}</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor={subjectKindFieldId}>
              {t("colSubjectKind")}
            </FieldLabel>
            <select
              id={subjectKindFieldId}
              name="subjectKind"
              className={SELECT_CLASS}
              required
              disabled={pending}
            >
              {SUBJECT_KINDS.map((kind) => (
                <option key={kind} value={kind}>
                  {t(`evidenceSubjectLabels.${kind}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor={subjectIdFieldId}>
              {t("colSubjectId")}
            </FieldLabel>
            <select
              id={subjectIdFieldId}
              name="subjectId"
              className={SELECT_CLASS}
              required
              disabled={pending}
            >
              <option value="">{t("fieldSourceRecordPlaceholder")}</option>
              {obligations.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.employeeLabel} · {row.id.slice(0, 8)}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor={employeeFieldId}>
              {t("colEmployee")}
            </FieldLabel>
            <select
              id={employeeFieldId}
              name="employeeId"
              className={SELECT_CLASS}
              disabled={pending}
            >
              <option value="">{t("notRecorded")}</option>
              {[
                ...new Map(
                  obligations.map(
                    (row) => [row.employeeId, row.employeeLabel] as const
                  )
                ).entries(),
              ].map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="msc-evidence-doc">
              {t("colDocument")}
            </FieldLabel>
            <Input
              id="msc-evidence-doc"
              name="documentId"
              required
              disabled={pending}
              placeholder={t("fieldDocumentIdPlaceholder")}
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
              t("saveEvidenceLink")
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
