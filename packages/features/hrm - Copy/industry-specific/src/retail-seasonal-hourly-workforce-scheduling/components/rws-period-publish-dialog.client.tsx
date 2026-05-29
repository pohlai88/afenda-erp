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

import { publishRwsSchedulePeriodAction } from "../actions/rws-period.actions"
import type { PublishRwsSchedulePeriodFormState } from "@afenda/feature-hrm-core/shared"
import type { RwsSchedulePeriodRow } from "../data/rws.types.shared"

const SELECT_CLASS =
  "h-9 w-full rounded border border-border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"

type RwsPeriodPublishDialogProps = {
  draftPeriods: readonly RwsSchedulePeriodRow[]
}

export function RwsPeriodPublishDialog({ draftPeriods }: RwsPeriodPublishDialogProps) {
  const t = useTranslations("Erp.Hrm.retailScheduling")
  const [state, formAction, pending] = useActionState<
    PublishRwsSchedulePeriodFormState | undefined,
    FormData
  >(publishRwsSchedulePeriodAction, undefined)

  const error = state && !state.ok ? state.errors : null

  if (draftPeriods.length === 0) {
    return null
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm">
          {t("publishPeriod")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("publishPeriodTitle")}</DialogTitle>
          <DialogDescription>{t("publishPeriodDescription")}</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="rws-publish-period">
              {t("fieldSchedulePeriod")}
            </FieldLabel>
            <select
              id="rws-publish-period"
              name="schedulePeriodId"
              className={SELECT_CLASS}
              required
              defaultValue={draftPeriods[0]?.id ?? ""}
            >
              {draftPeriods.map((period) => (
                <option key={period.id} value={period.id}>
                  {period.code} — {period.storeLabel} ({period.periodStartDate} →{" "}
                  {period.periodEndDate})
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="rws-publish-note">{t("fieldNote")}</FieldLabel>
            <Input id="rws-publish-note" name="note" />
          </Field>
          {error?.form ? <FieldError>{error.form}</FieldError> : null}
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            {t("publishPeriodSubmit")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
