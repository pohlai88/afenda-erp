"use client"

import { useActionState } from "react"
import { useTranslations } from "next-intl"
import { Loader2 } from "lucide-react"

import { Button } from "@afenda/ui/button"

import { exportMscComplianceReportAction } from "../actions/msc-report.actions"
import type { ExportMscReportFormState } from "../data/msc-form-state.shared"

export function MscReportExportButton() {
  const t = useTranslations("Erp.Hrm.manufacturingSafety")
  const [state, formAction, pending] = useActionState<
    ExportMscReportFormState | undefined,
    FormData
  >(async (prev, formData) => {
    const next = await exportMscComplianceReportAction(prev, formData)
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
