"use client"

import { useActionState } from "react"
import { useTranslations } from "next-intl"

import { Button } from "@afenda/ui/button"
import { Field, FieldDescription, FieldLabel } from "@afenda/ui/field"
import { Textarea } from "@afenda/ui/textarea"

import { replayOfflineTimeClockPunchBatchAction } from "../client"
import type { ReplayOfflineTimeClockBatchFormState } from "../tci-action-state.shared"

const initialState: ReplayOfflineTimeClockBatchFormState = {
  ok: false,
  errors: {},
}

export function TimeClockOfflineReplayForm() {
  const t = useTranslations("Erp.Hrm.timeClock.offlineReplay")
  const [state, formAction, pending] = useActionState(
    replayOfflineTimeClockPunchBatchAction,
    initialState
  )

  const formError = !state.ok ? state.errors.form : undefined

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field data-invalid={formError ? true : undefined}>
        <FieldLabel htmlFor="time-clock-offline-batch-json">
          {t("batchJsonLabel")}
        </FieldLabel>
        <Textarea
          id="time-clock-offline-batch-json"
          name="batchJson"
          rows={6}
          className="font-mono text-xs"
          placeholder={t("batchJsonPlaceholder")}
          aria-invalid={formError ? true : undefined}
        />
        <FieldDescription>{t("batchJsonHint")}</FieldDescription>
        {formError ? (
          <p className="text-sm text-destructive" role="alert">
            {formError}
          </p>
        ) : null}
      </Field>
      {state.ok ? (
        <p className="text-sm text-muted-foreground" role="status">
          {t("success", {
            batchId: state.batchId,
            accepted: state.accepted,
            duplicates: state.duplicates,
            rejected: state.rejected,
          })}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? t("submitting") : t("submit")}
      </Button>
    </form>
  )
}
