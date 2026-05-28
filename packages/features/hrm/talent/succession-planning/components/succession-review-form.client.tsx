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
  closeSuccessionReviewCycleAction,
  createSuccessionReviewCycleAction,
} from "../actions/succession-review.actions"
import type { SuccessionMutationFormState } from "../schemas/succession.schema"
import type { SuccessionReviewCycleRow } from "../data/succession.types.shared"

export function SuccessionReviewCycleFormDialog() {
  const t = useTranslations("Erp.Hrm.successionPlanning")
  const [state, formAction, pending] = useActionState<
    SuccessionMutationFormState | undefined,
    FormData
  >(createSuccessionReviewCycleAction, undefined)

  const error = state && !state.ok ? state.errors : null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          {t("createReviewCycle")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createReviewCycleTitle")}</DialogTitle>
          <DialogDescription>{t("createReviewCycleDescription")}</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="succession-review-title">{t("fieldTitle")}</FieldLabel>
            <Input id="succession-review-title" name="title" required />
          </Field>
          <Field>
            <FieldLabel htmlFor="succession-review-due">{t("fieldDueDate")}</FieldLabel>
            <Input id="succession-review-due" name="dueDate" type="date" />
          </Field>
          {error?.form ? <FieldError>{error.form}</FieldError> : null}
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            {t("saveReviewCycle")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

type SuccessionCloseReviewCycleButtonProps = {
  cycle: SuccessionReviewCycleRow
}

export function SuccessionCloseReviewCycleButton({
  cycle,
}: SuccessionCloseReviewCycleButtonProps) {
  const t = useTranslations("Erp.Hrm.successionPlanning")
  const [state, formAction, pending] = useActionState<
    SuccessionMutationFormState | undefined,
    FormData
  >(closeSuccessionReviewCycleAction, undefined)

  if (cycle.cycleState === "closed") return null

  return (
    <form action={formAction} className="inline-flex">
      <input type="hidden" name="reviewCycleId" value={cycle.id} />
      <Button type="submit" size="sm" variant="secondary" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
        {t("closeReviewCycle")}
      </Button>
      {state && !state.ok && state.errors.form ? (
        <span className="text-sm text-destructive">{state.errors.form}</span>
      ) : null}
    </form>
  )
}
