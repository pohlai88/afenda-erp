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

import { createGpgLocalityRuleAction } from "../actions/gpg-assignment.actions"
import { HRM_GPG_LOCALITY_TYPES } from "../schemas/gpg-workflow-state.shared"
import type { CreateGpgLocalityRuleFormState } from "../../../_core/shared"

const SELECT_CLASS =
  "h-9 w-full rounded border border-border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"

export function GpgLocalityRuleCreateDialog() {
  const t = useTranslations("Erp.Hrm.governmentPayGrades")
  const [state, formAction, pending] = useActionState<
    CreateGpgLocalityRuleFormState | undefined,
    FormData
  >(createGpgLocalityRuleAction, undefined)

  const error = state && !state.ok ? state.errors : null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          {t("createLocalityRule")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("createLocalityRuleTitle")}</DialogTitle>
          <DialogDescription>
            {t("createLocalityRuleDescription")}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="gpg-lr-code">{t("fieldCode")}</FieldLabel>
            <Input id="gpg-lr-code" name="code" required disabled={pending} />
          </Field>
          <Field>
            <FieldLabel htmlFor="gpg-lr-name">{t("fieldName")}</FieldLabel>
            <Input id="gpg-lr-name" name="name" required disabled={pending} />
          </Field>
          <Field>
            <FieldLabel htmlFor="gpg-lr-type">
              {t("fieldLocalityType")}
            </FieldLabel>
            <select
              id="gpg-lr-type"
              name="localityType"
              className={SELECT_CLASS}
              disabled={pending}
              defaultValue="locality_area"
            >
              {HRM_GPG_LOCALITY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`localityTypeLabels.${type}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="gpg-lr-pct">
              {t("fieldAdjustmentPercent")}
            </FieldLabel>
            <Input
              id="gpg-lr-pct"
              name="adjustmentPercent"
              disabled={pending}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="gpg-lr-effective">
              {t("fieldEffectiveDate")}
            </FieldLabel>
            <Input
              id="gpg-lr-effective"
              name="effectiveDate"
              type="date"
              required
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
              t("save")
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
