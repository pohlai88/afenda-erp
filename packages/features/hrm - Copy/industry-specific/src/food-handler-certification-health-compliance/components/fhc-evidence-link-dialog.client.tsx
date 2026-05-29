"use client"

import { useActionState } from "react"
import { useTranslations } from "next-intl"
import { Loader2, Paperclip } from "lucide-react"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@afenda/ui/select"

import { linkFhcEvidenceFormAction } from "../actions/fhc-evidence.actions"
import type { LinkFhcEvidenceFormState } from "@afenda/feature-hrm-core/shared"
import type {
  FhcEmployeeObligationRow,
  FhcEvidenceDocumentChoiceRow,
} from "../data/fhc.types.shared"

type FhcEvidenceLinkDialogProps = {
  obligation: FhcEmployeeObligationRow
  subjectKind: "permit" | "health_certificate"
  linkCount: number
  documentChoices: readonly FhcEvidenceDocumentChoiceRow[]
}

export function FhcEvidenceLinkDialog({
  obligation,
  subjectKind,
  linkCount,
  documentChoices,
}: FhcEvidenceLinkDialogProps) {
  const t = useTranslations("Erp.Hrm.foodHandlerCompliance")
  const [state, formAction, pending] = useActionState<
    LinkFhcEvidenceFormState | undefined,
    FormData
  >(linkFhcEvidenceFormAction, undefined)
  const error = state && !state.ok ? state.errors : null
  const resolvedCount = state && state.ok ? state.linkCount : linkCount

  const labelKey =
    subjectKind === "permit" ? "linkPermitEvidence" : "linkHealthEvidence"

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          <Paperclip className="size-3.5" aria-hidden />
          {t(labelKey)}
          {resolvedCount > 0 ? (
            <Badge variant="secondary" className="ml-1">
              {resolvedCount}
            </Badge>
          ) : null}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("linkEvidenceTitle")}</DialogTitle>
          <DialogDescription>{t("linkEvidenceDescription")}</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="obligationId" value={obligation.id} />
          <input type="hidden" name="subjectKind" value={subjectKind} />
          <Field>
            <FieldLabel htmlFor={`fhc-doc-${obligation.id}-${subjectKind}`}>
              {t("fieldDocument")}
            </FieldLabel>
            {documentChoices.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("evidenceDocumentsEmpty")}
              </p>
            ) : (
              <Select name="documentId" required disabled={pending}>
                <SelectTrigger
                  id={`fhc-doc-${obligation.id}-${subjectKind}`}
                  className="w-full"
                >
                  <SelectValue placeholder={t("fieldDocumentPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {documentChoices.map((doc) => (
                    <SelectItem key={doc.id} value={doc.id}>
                      {doc.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {error?.form ? <FieldError>{error.form}</FieldError> : null}
          </Field>
          <Button
            type="submit"
            disabled={pending || documentChoices.length === 0}
          >
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
