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

import { createGpgClassificationAction } from "../actions/gpg-master.actions"
import { HRM_GPG_CLASSIFICATION_SCHEMES } from "../schemas/gpg-workflow-state.shared"
import type { CreateGpgClassificationFormState } from "@afenda/feature-hrm-core/shared"

const SELECT_CLASS =
  "h-9 w-full rounded border border-border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"

export function GpgClassificationCreateDialog() {
  const t = useTranslations("Erp.Hrm.governmentPayGrades")
  const [state, formAction, pending] = useActionState<
    CreateGpgClassificationFormState | undefined,
    FormData
  >(createGpgClassificationAction, undefined)

  const error = state && !state.ok ? state.errors : null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          {t("createClassification")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("createClassificationTitle")}</DialogTitle>
          <DialogDescription>
            {t("createClassificationDescription")}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="gpg-cl-code">{t("fieldCode")}</FieldLabel>
            <Input id="gpg-cl-code" name="code" required disabled={pending} />
          </Field>
          <Field>
            <FieldLabel htmlFor="gpg-cl-name">{t("fieldName")}</FieldLabel>
            <Input id="gpg-cl-name" name="name" required disabled={pending} />
          </Field>
          <Field>
            <FieldLabel htmlFor="gpg-cl-scheme">{t("fieldScheme")}</FieldLabel>
            <select
              id="gpg-cl-scheme"
              name="scheme"
              className={SELECT_CLASS}
              disabled={pending}
              defaultValue="civil_service"
            >
              {HRM_GPG_CLASSIFICATION_SCHEMES.map((scheme) => (
                <option key={scheme} value={scheme}>
                  {t(`schemeLabels.${scheme}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="gpg-cl-effective">
              {t("fieldEffectiveDate")}
            </FieldLabel>
            <Input
              id="gpg-cl-effective"
              name="effectiveDate"
              type="date"
              required
              disabled={pending}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="gpg-cl-occ">
              {t("fieldOccupationalGroup")}
            </FieldLabel>
            <Input
              id="gpg-cl-occ"
              name="occupationalGroup"
              disabled={pending}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="gpg-cl-series">
              {t("fieldJobSeries")}
            </FieldLabel>
            <Input id="gpg-cl-series" name="jobSeries" disabled={pending} />
          </Field>
          <Field>
            <FieldLabel htmlFor="gpg-cl-family">
              {t("fieldJobFamily")}
            </FieldLabel>
            <Input id="gpg-cl-family" name="jobFamily" disabled={pending} />
          </Field>
          <Field>
            <FieldLabel htmlFor="gpg-cl-agency">
              {t("fieldAgencyRef")}
            </FieldLabel>
            <Input id="gpg-cl-agency" name="agencyRef" disabled={pending} />
          </Field>
          <Field>
            <FieldLabel htmlFor="gpg-cl-dept">
              {t("fieldDepartmentRef")}
            </FieldLabel>
            <Input id="gpg-cl-dept" name="departmentRef" disabled={pending} />
          </Field>
          <Field>
            <FieldLabel htmlFor="gpg-cl-pos">
              {t("fieldPositionRef")}
            </FieldLabel>
            <Input id="gpg-cl-pos" name="positionRef" disabled={pending} />
          </Field>
          {error?.form ? <FieldError>{error.form}</FieldError> : null}
          <Button type="submit" disabled={pending}>
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
