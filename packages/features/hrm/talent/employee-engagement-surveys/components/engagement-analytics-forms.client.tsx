"use client"

import { useActionState, useState, useTransition } from "react"
import { useTranslations } from "next-intl"
import { Download, Loader2, RefreshCw } from "lucide-react"

import { Button } from "@afenda/ui/button"
import { Input } from "@afenda/ui/input"
import { Label } from "@afenda/ui/label"

import {
  exportEngagementAnalyticsReportCsvAction,
  generateEngagementAnalyticsAction,
  tagEngagementOpenTextAction,
} from "../actions/engagement-analytics.actions"
import type { EngagementDesignFormState } from "../schemas/engagement-form-state.shared"
import { engagementAnalyticsExportTriggerId } from "../engagement-export-toolbar.shared"
import { EngagementFormFeedback } from "./engagement-form-feedback.client"

const initialState: EngagementDesignFormState = { ok: false, errors: {} }

export function GenerateEngagementAnalyticsForm({
  surveyId,
  canGenerate,
}: {
  surveyId: string
  canGenerate: boolean
}) {
  const t = useTranslations("Erp.Hrm.employeeEngagement.distribution.analytics")
  const [state, action, pending] = useActionState(
    generateEngagementAnalyticsAction,
    initialState
  )

  return (
    <form action={action} className="flex flex-col items-end gap-2">
      <input type="hidden" name="surveyId" value={surveyId} />
      <div className="flex w-full max-w-xs flex-col gap-1.5">
        <Label htmlFor={`eng-external-ref-${surveyId}`}>
          {t("fieldExternalBenchmark")}
        </Label>
        <Input
          id={`eng-external-ref-${surveyId}`}
          name="externalReference"
          maxLength={200}
          placeholder={t("externalBenchmarkPlaceholder")}
          disabled={!canGenerate || pending}
        />
      </div>
      <Button
        type="submit"
        size="sm"
        variant="outline"
        disabled={!canGenerate || pending}
      >
        {pending ? (
          <>
            <Loader2
              className="size-4 animate-spin"
              data-icon="inline-start"
              aria-hidden
            />
            {t("generatePending")}
          </>
        ) : (
          <>
            <RefreshCw
              className="size-4"
              data-icon="inline-start"
              aria-hidden
            />
            {t("generateAction")}
          </>
        )}
      </Button>
      <EngagementFormFeedback state={state} />
    </form>
  )
}

export function EngagementAnalyticsExportButton({
  surveyId,
  canExport,
}: {
  surveyId: string
  canExport: boolean
}) {
  const t = useTranslations("Erp.Hrm.employeeEngagement.distribution.analytics")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        id={engagementAnalyticsExportTriggerId(surveyId)}
        type="button"
        size="sm"
        variant="outline"
        disabled={!canExport || pending}
        onClick={() => {
          setError(null)
          startTransition(async () => {
            const result = await exportEngagementAnalyticsReportCsvAction({
              surveyId,
            })
            if (!result.ok) {
              setError(result.error)
              return
            }
            const blob = new Blob([result.csv], {
              type: "text/csv;charset=utf-8",
            })
            const url = URL.createObjectURL(blob)
            const anchor = document.createElement("a")
            anchor.href = url
            anchor.download = result.filename
            anchor.click()
            URL.revokeObjectURL(url)
          })
        }}
      >
        {pending ? (
          <>
            <Loader2
              className="size-4 animate-spin"
              data-icon="inline-start"
              aria-hidden
            />
            {t("exportPending")}
          </>
        ) : (
          <>
            <Download className="size-4" data-icon="inline-start" aria-hidden />
            {t("exportAction")}
          </>
        )}
      </Button>
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function TagEngagementOpenTextForm({
  surveyId,
  reviewId,
  initialTags,
  canTag,
}: {
  surveyId: string
  reviewId: string
  initialTags: string
  canTag: boolean
}) {
  const t = useTranslations("Erp.Hrm.employeeEngagement.distribution.analytics")
  const [state, action, pending] = useActionState(
    tagEngagementOpenTextAction,
    initialState
  )

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="surveyId" value={surveyId} />
      <input type="hidden" name="reviewId" value={reviewId} />
      <div className="flex flex-col gap-1">
        <Label htmlFor={`tags-${reviewId}`} className="text-xs">
          {t("openTextTagsField")}
        </Label>
        <Input
          id={`tags-${reviewId}`}
          name="tags"
          defaultValue={initialTags}
          placeholder={t("openTextTagsPlaceholder")}
          disabled={!canTag || pending}
        />
      </div>
      <Button
        type="submit"
        size="sm"
        variant="secondary"
        disabled={!canTag || pending}
      >
        {t("openTextTagsSave")}
      </Button>
      <EngagementFormFeedback state={state} />
    </form>
  )
}
