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

import { createGpgPayGradeAction } from "../actions/gpg-master.actions"
import type { GpgClassificationChoiceRow } from "../data/gpg.types.shared"
import type { CreateGpgPayGradeFormState } from "@afenda/feature-hrm-core/shared"

const SELECT_CLASS =
  "h-9 w-full rounded border border-border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"

export function GpgPayGradeCreateDialog({
  classifications,
}: {
  classifications: readonly GpgClassificationChoiceRow[]
}) {
  const t = useTranslations("Erp.Hrm.governmentPayGrades")
  const [state, formAction, pending] = useActionState<
    CreateGpgPayGradeFormState | undefined,
    FormData
  >(createGpgPayGradeAction, undefined)

  const error = state && !state.ok ? state.errors : null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          {t("createPayGrade")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createPayGradeTitle")}</DialogTitle>
          <DialogDescription>
            {t("createPayGradeDescription")}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="gpg-pg-class">
              {t("fieldClassification")}
            </FieldLabel>
            <select
              id="gpg-pg-class"
              name="classificationId"
              className={SELECT_CLASS}
              required
              disabled={pending || classifications.length === 0}
            >
              {classifications.length === 0 ? (
                <option value="">{t("noClassificationsYet")}</option>
              ) : (
                classifications.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.label}
                  </option>
                ))
              )}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="gpg-pg-code">{t("fieldCode")}</FieldLabel>
            <Input id="gpg-pg-code" name="code" required disabled={pending} />
          </Field>
          <Field>
            <FieldLabel htmlFor="gpg-pg-name">{t("fieldName")}</FieldLabel>
            <Input id="gpg-pg-name" name="name" required disabled={pending} />
          </Field>
          <Field>
            <FieldLabel htmlFor="gpg-pg-effective">
              {t("fieldEffectiveDate")}
            </FieldLabel>
            <Input
              id="gpg-pg-effective"
              name="effectiveDate"
              type="date"
              required
              disabled={pending}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="gpg-pg-gs">
              {t("fieldGsEquivalent")}
            </FieldLabel>
            <Input id="gpg-pg-gs" name="gsEquivalent" disabled={pending} />
          </Field>
          <Field>
            <FieldLabel htmlFor="gpg-pg-ses">
              {t("fieldSesEquivalent")}
            </FieldLabel>
            <Input id="gpg-pg-ses" name="sesEquivalent" disabled={pending} />
          </Field>
          <Field>
            <FieldLabel htmlFor="gpg-pg-cs">
              {t("fieldCivilServiceGradeRef")}
            </FieldLabel>
            <Input
              id="gpg-pg-cs"
              name="civilServiceGradeRef"
              disabled={pending}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="gpg-pg-rank">
              {t("fieldRankEquivalent")}
            </FieldLabel>
            <Input id="gpg-pg-rank" name="rankEquivalent" disabled={pending} />
          </Field>
          {error?.form ? <FieldError>{error.form}</FieldError> : null}
          <Button
            type="submit"
            disabled={pending || classifications.length === 0}
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                {t("saving")}
              </>
            ) : (
              t("save")
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
