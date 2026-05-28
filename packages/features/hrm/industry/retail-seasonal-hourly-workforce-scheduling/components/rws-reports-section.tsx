"use client"

import { useActionState } from "react"
import { useTranslations } from "next-intl"
import { Loader2 } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { Button } from "@afenda/ui/button"
import { Field, FieldLabel } from "@afenda/ui/field"

import { exportRwsReportAction } from "../actions/rws-report.actions"
import type { ExportRwsReportFormState } from "../../../_core/shared"

const SELECT_CLASS =
  "h-9 w-full rounded border border-border bg-background px-2 text-sm"

export function RwsReportsSection({ canAudit }: { canAudit: boolean }) {
  const t = useTranslations("Erp.Hrm.retailScheduling")
  const [state, formAction, pending] = useActionState<
    ExportRwsReportFormState | undefined,
    FormData
  >(exportRwsReportAction, undefined)

  if (!canAudit) {
    return (
      <Card size="sm" data-testid="rws-reports-section">
        <CardHeader>
          <CardTitle>{t("reportsTitle")}</CardTitle>
          <CardDescription>{t("reportsDenied")}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const download =
    state?.ok && "csv" in state
      ? () => {
          const blob = new Blob([state.csv], { type: "text/csv;charset=utf-8" })
          const url = URL.createObjectURL(blob)
          const anchor = document.createElement("a")
          anchor.href = url
          anchor.download = state.filename
          anchor.click()
          URL.revokeObjectURL(url)
        }
      : null

  return (
    <Card size="sm" data-testid="rws-reports-section">
      <CardHeader>
        <CardTitle>{t("reportsTitle")}</CardTitle>
        <CardDescription>{t("reportsDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Field className="min-w-[12rem] flex-1">
            <FieldLabel htmlFor="reportKind">{t("fieldReportKind")}</FieldLabel>
            <select
              id="reportKind"
              name="reportKind"
              className={SELECT_CLASS}
              defaultValue="coverage"
            >
              <option value="coverage">{t("reportKindCoverage")}</option>
              <option value="periods">{t("reportKindPeriods")}</option>
              <option value="open_shifts">{t("reportKindOpenShifts")}</option>
              <option value="labor_summary">{t("reportKindLaborSummary")}</option>
            </select>
          </Field>
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            {t("exportReport")}
          </Button>
        </form>
        {state?.ok && download ? (
          <Button type="button" variant="secondary" size="sm" onClick={download}>
            {t("downloadCsv", { count: state.rowCount })}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  )
}
