import { getFormatter, getTranslations } from "next-intl/server"

import { GovernedPatternBListSection } from "@afenda/governed-surface/server"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"

import {
  listSuccessionBenchStrength,
  listSuccessionReviewCyclesForOrg,
  listSuccessionRiskSnapshotsForOrg,
} from "../data/succession-bench.server"
import { buildSuccessionBenchStrengthListSurfaceConfiguration } from "../data/succession-surface-builders.server"
import { SUCCESSION_LIST_SURFACE_IDS } from "../data/succession-surface-metadata.shared"
import {
  SuccessionCloseReviewCycleButton,
  SuccessionReviewCycleFormDialog,
} from "./succession-review-form.client"

export async function SuccessionBenchRiskSection({
  organizationId,
  canManage,
}: {
  organizationId: string
  canManage: boolean
}) {
  const [t, format] = await Promise.all([
    getTranslations("Erp.Hrm.successionPlanning"),
    getFormatter(),
  ])

  const [benchRows, riskSnapshots, reviewCycles] = await Promise.all([
    listSuccessionBenchStrength(organizationId),
    listSuccessionRiskSnapshotsForOrg(organizationId),
    listSuccessionReviewCyclesForOrg(organizationId),
  ])

  const listConfiguration = buildSuccessionBenchStrengthListSurfaceConfiguration(
    benchRows,
    {
      empty: t("benchStrengthEmpty"),
      colRole: t("colRole"),
      colReadyNow: t("colReadyNow"),
      colNominations: t("colNominations"),
      colScore: t("colBenchScore"),
      colRisk: t("colRisk"),
      colFlags: t("colFlags"),
    }
  )

  return (
    <Card
      size="sm"
      id="succession-bench-risk-section"
      data-testid="succession-bench-risk-section"
    >
      <CardHeader>
        <CardTitle>{t("benchRiskTitle")}</CardTitle>
        <CardDescription>{t("benchRiskDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <GovernedPatternBListSection
          layout="embedded"
          title=""
          listConfiguration={listConfiguration}
          surfaceKey={SUCCESSION_LIST_SURFACE_IDS.benchStrength}
          data-testid={`governed-list-section:${SUCCESSION_LIST_SURFACE_IDS.benchStrength}`}
        />
        <div className="flex flex-col gap-6 border-t border-border pt-6">
        <div>
          <h3 className="text-sm font-medium">{t("riskSnapshotsTitle")}</h3>
          <p className="text-sm text-muted-foreground">{t("riskSnapshotsDescription")}</p>
          {riskSnapshots.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">{t("riskSnapshotsEmpty")}</p>
          ) : (
            <ul className="mt-2 divide-y divide-border text-sm">
              {riskSnapshots.slice(0, 8).map((row) => (
                <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <span>
                    {row.criticalRoleTitle} — {row.riskLevel}
                  </span>
                  <span className="text-muted-foreground">
                    {format.dateTime(row.computedAt, { dateStyle: "medium" })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {canManage ? (
          <div className="flex flex-col gap-4">
            <SuccessionReviewCycleFormDialog />
            {reviewCycles
              .filter((cycle) => cycle.cycleState !== "closed")
              .map((cycle) => (
                <div
                  key={cycle.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded border border-border px-3 py-2"
                >
                  <span className="text-sm font-medium">{cycle.title}</span>
                  <SuccessionCloseReviewCycleButton cycle={cycle} />
                </div>
              ))}
          </div>
        ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
