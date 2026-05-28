"use client"

import { useActionState } from "react"
import { useTranslations } from "next-intl"

import { GovernedSection } from "@afenda/governed-surface/client"
import { Button } from "@afenda/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { Separator } from "@afenda/ui/separator"

import { generateAllStatutoryPacksAction } from "../actions/compliance.actions"
import type { GenerateAllStatutoryPacksFormState } from "../../_core/shared"

type CompliancePayrollPeriod = {
  id: string
  state: string
  periodStart: string
  periodEnd: string
  rulePackVersion: string | null
}

function GenerateAllPacksButton({
  periodId,
  disabled,
}: {
  periodId: string
  disabled: boolean
}) {
  const t = useTranslations("Erp.Hrm.compliance")
  const initial: GenerateAllStatutoryPacksFormState = {
    ok: false,
    code: "validation",
    message: "",
  }
  const [state, dispatch, isPending] = useActionState(
    generateAllStatutoryPacksAction,
    initial
  )

  return (
    <form action={dispatch} className="inline-flex items-center gap-3">
      <input type="hidden" name="periodId" value={periodId} />
      <Button
        type="submit"
        size="sm"
        disabled={disabled || isPending}
        data-testid="hrm-compliance-generate-all-packs"
      >
        {isPending ? t("generating") : t("generateAll")}
      </Button>
      {state.ok ? (
        <span className="text-sm text-muted-foreground">
          {t("generatedSummary", {
            count: state.count,
            version: state.rulePackVersion,
          })}
        </span>
      ) : null}
      {!state.ok && state.message ? (
        <p className="text-sm text-destructive">{state.message}</p>
      ) : null}
    </form>
  )
}

export type ComplianceStatutoryPackControlsProps = {
  period: CompliancePayrollPeriod | null
  allPeriods: CompliancePayrollPeriod[]
}

export function ComplianceStatutoryPackControls({
  period,
  allPeriods,
}: ComplianceStatutoryPackControlsProps) {
  const t = useTranslations("Erp.Hrm.compliance")
  const canGenerate = period?.state === "locked"

  return (
    <GovernedSection title={t("title")} description={t("description")}>
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            {period && !canGenerate ? (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                {t("requireLockedPeriod")}
              </p>
            ) : null}
          </div>
          {period ? (
            <GenerateAllPacksButton
              periodId={period.id}
              disabled={!canGenerate}
            />
          ) : null}
        </div>

        {allPeriods.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                {t("periodSelector")}
              </CardTitle>
              <CardDescription>
                {t("periodSelectorDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form method="GET">
                <select
                  name="periodId"
                  defaultValue={period?.id ?? ""}
                  onChange={(e) => {
                    const form = e.currentTarget.form
                    if (form) form.requestSubmit()
                  }}
                  className="h-9 w-64 rounded border border-border bg-background px-2 text-sm"
                >
                  <option value="">{t("selectPeriod")}</option>
                  {allPeriods.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.periodStart} — {p.periodEnd}
                    </option>
                  ))}
                </select>
              </form>
            </CardContent>
          </Card>
        ) : null}

        {period?.rulePackVersion ? (
          <>
            <Separator />
            <p className="text-xs text-muted-foreground">
              {t("rulePackVersion")}:{" "}
              <span className="font-mono">{period.rulePackVersion}</span>
            </p>
          </>
        ) : null}
      </div>
    </GovernedSection>
  )
}
