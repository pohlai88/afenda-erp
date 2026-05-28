"use client"

import { useState, useTransition } from "react"
import { useTranslations } from "next-intl"
import { Loader2 } from "lucide-react"

import { Button } from "@afenda/ui/button"

import { exportFrmFieldWorkforceReportAction } from "../actions/frm-report.actions"

export function FrmExportReportButton() {
  const t = useTranslations("Erp.Hrm.fieldWorkforce")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => {
          setError(null)
          startTransition(async () => {
            const result = await exportFrmFieldWorkforceReportAction()
            if (!result.ok) {
              setError(result.errors.form ?? t("exportFailed"))
              return
            }
            const blob = new Blob([result.csv], {
              type: "text/csv;charset=utf-8",
            })
            const url = URL.createObjectURL(blob)
            const anchor = document.createElement("a")
            anchor.href = url
            anchor.download = "field-workforce-report.csv"
            anchor.click()
            URL.revokeObjectURL(url)
          })
        }}
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            {t("exporting")}
          </>
        ) : (
          t("exportReport")
        )}
      </Button>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}
