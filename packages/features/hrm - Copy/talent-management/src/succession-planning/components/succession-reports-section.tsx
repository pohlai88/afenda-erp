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

import { exportSuccessionReportAction } from "../actions/succession-review.actions"
import type { ExportSuccessionReportFormState } from "../schemas/succession.schema"

const SELECT_CLASS =
  "h-9 w-full rounded border border-border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"

export function SuccessionReportsSection({ canAudit }: { canAudit: boolean }) {
  const t = useTranslations("Erp.Hrm.successionPlanning")
  const [state, formAction, pending] = useActionState<
    ExportSuccessionReportFormState | undefined,
    FormData
  >(exportSuccessionReportAction, undefined)

  if (!canAudit) {
    return null
  }

  return (
    <Card size="sm" id="succession-reports-section" data-testid="succession-reports-section">
      <CardHeader>
        <CardTitle>{t("reportsTitle")}</CardTitle>
        <CardDescription>{t("reportsDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form action={formAction} className="flex flex-wrap items-end gap-3">
          <Field>
            <FieldLabel htmlFor="succession-report-kind">{t("fieldReportKind")}</FieldLabel>
            <select id="succession-report-kind" name="reportKind" className={SELECT_CLASS}>
              <option value="critical_roles">{t("reportKindLabels.critical_roles")}</option>
              <option value="nominations">{t("reportKindLabels.nominations")}</option>
              <option value="bench_strength">{t("reportKindLabels.bench_strength")}</option>
              <option value="risk_flags">{t("reportKindLabels.risk_flags")}</option>
            </select>
          </Field>
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            {t("exportReport")}
          </Button>
        </form>
        {state?.ok ? (
          <p className="text-sm text-muted-foreground">
            {t("exportSuccess", { filename: state.filename, rowCount: state.rowCount })}
          </p>
        ) : null}
        {state && !state.ok && state.errors.form ? (
          <p className="text-sm text-destructive">{state.errors.form}</p>
        ) : null}
      </CardContent>
    </Card>
  )
}
