"use client"

import { useActionState } from "react"
import { useTranslations } from "next-intl"
import { Loader2 } from "lucide-react"

import { Button } from "@afenda/ui/button"

import { exportGpgOrgReportAction } from "../actions/gpg-report.actions"
import type { ExportGpgReportFormState } from "@afenda/feature-hrm-core/shared"

export function GpgReportExportButton() {
  const t = useTranslations("Erp.Hrm.governmentPayGrades")
  const [state, formAction, pending] = useActionState<
    ExportGpgReportFormState | undefined,
    FormData
  >(async (prev, formData) => {
    const next = await exportGpgOrgReportAction(prev, formData)
    if (next?.ok) {
      const blob = new Blob([next.csv], { type: "text/csv;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = next.filename
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
      URL.revokeObjectURL(url)
    }
    return next
  }, undefined)

  return (
    <form action={formAction}>
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            {t("exportingReport")}
          </>
        ) : (
          t("exportReport")
        )}
      </Button>
      {state && !state.ok && state.errors?.form ? (
        <p className="mt-2 text-sm text-destructive">{state.errors.form}</p>
      ) : null}
    </form>
  )
}
