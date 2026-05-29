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

import { exportUcbReportAction } from "../actions/ucb-review.actions"
import type { ExportUcbReportFormState } from "../schemas/ucb.schema"

const SELECT_CLASS =
  "h-9 w-full rounded border border-border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"

export function UcbReportsSection({ canAudit }: { canAudit: boolean }) {
  const t = useTranslations("Erp.Hrm.unionManagement")
  const [state, formAction, pending] = useActionState<
    ExportUcbReportFormState | undefined,
    FormData
  >(exportUcbReportAction, undefined)

  if (!canAudit) {
    return null
  }

  return (
    <Card size="sm" id="ucb-reports-section" data-testid="ucb-reports-section">
      <CardHeader>
        <CardTitle>{t("reportsTitle")}</CardTitle>
        <CardDescription>{t("reportsDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form action={formAction} className="flex flex-wrap items-end gap-3">
          <Field>
            <FieldLabel htmlFor="ucb-report-kind">{t("fieldReportKind")}</FieldLabel>
            <select id="ucb-report-kind" name="reportKind" className={SELECT_CLASS}>
              <option value="membership">{t("reportKindLabels.membership")}</option>
              <option value="grievances">{t("reportKindLabels.grievances")}</option>
              <option value="compliance">{t("reportKindLabels.compliance")}</option>
              <option value="dues">{t("reportKindLabels.dues")}</option>
              <option value="agreements">{t("reportKindLabels.agreements")}</option>
            </select>
          </Field>
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            {t("exportReport")}
          </Button>
        </form>
        {state?.ok ? (
          <p className="text-sm text-muted-foreground">
            {t("exportSuccess", {
              filename: state.filename,
              rowCount: state.rowCount,
            })}
          </p>
        ) : null}
        {state && !state.ok && state.errors.form ? (
          <p className="text-sm text-destructive">{state.errors.form}</p>
        ) : null}
      </CardContent>
    </Card>
  )
}
