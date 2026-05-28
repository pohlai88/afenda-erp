"use client"

import { useState, useTransition } from "react"
import { useTranslations } from "next-intl"

import { Button } from "@afenda/ui/button"

import { exportComplianceOverviewCsvAction } from "../actions/compliance-report.actions"

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function ComplianceOverviewExportActions() {
  const t = useTranslations("Erp.Hrm.compliance.reports")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  return (
    <div className="flex flex-wrap items-center gap-2">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        data-testid="hrm-compliance-export-overview"
        onClick={() => {
          setError(null)
          startTransition(async () => {
            const result = await exportComplianceOverviewCsvAction()
            if (!result.ok) {
              setError(result.error)
              return
            }
            downloadCsv(result.filename, result.csv)
          })
        }}
      >
        {pending ? t("exporting") : t("exportOverview")}
      </Button>
    </div>
  )
}
