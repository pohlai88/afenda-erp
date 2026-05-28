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

import { createGpgStepIncreaseRuleAction } from "../actions/gpg-step-increase.actions"
import type { CreateGpgStepIncreaseRuleFormState } from "../../../_core/shared"

export function GpgStepIncreaseRuleCreateDialog() {
  const t = useTranslations("Erp.Hrm.governmentPayGrades")
  const [state, formAction, pending] = useActionState<
    CreateGpgStepIncreaseRuleFormState | undefined,
    FormData
  >(createGpgStepIncreaseRuleAction, undefined)

  const error = state && !state.ok ? state.errors : null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          {t("createStepRule")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createStepRuleTitle")}</DialogTitle>
          <DialogDescription>
            {t("createStepRuleDescription")}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="gpg-sr-code">{t("fieldCode")}</FieldLabel>
            <Input id="gpg-sr-code" name="code" required disabled={pending} />
          </Field>
          <Field>
            <FieldLabel htmlFor="gpg-sr-name">{t("fieldName")}</FieldLabel>
            <Input id="gpg-sr-name" name="name" required disabled={pending} />
          </Field>
          <Field>
            <FieldLabel htmlFor="gpg-sr-wait">
              {t("fieldWaitingPeriodMonths")}
            </FieldLabel>
            <Input
              id="gpg-sr-wait"
              name="waitingPeriodMonths"
              type="number"
              min={1}
              defaultValue={12}
              required
              disabled={pending}
            />
          </Field>
          <Field className="flex flex-row items-center gap-2">
            <input
              id="gpg-sr-approval"
              name="requiresApproval"
              type="checkbox"
              defaultChecked
              disabled={pending}
              className="size-4 rounded border border-border"
            />
            <FieldLabel htmlFor="gpg-sr-approval" className="mb-0">
              {t("fieldRequiresApproval")}
            </FieldLabel>
          </Field>
          <Field>
            <FieldLabel htmlFor="gpg-sr-min-rating">
              {t("fieldMinManagerRating")}
            </FieldLabel>
            <Input
              id="gpg-sr-min-rating"
              name="minManagerRating"
              type="number"
              min={0}
              max={10}
              step="0.1"
              placeholder={t("fieldMinManagerRatingPlaceholder")}
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
