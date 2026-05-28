import { getTranslations } from "next-intl/server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import {
  buildKpiPeriodsListSurfaceConfiguration,
  buildKpiScoresListSurfaceConfiguration,
} from "../data/kpi-metrics-list-surface.server"
import type { KpiPeriodRow, KpiScoreListRow } from "../data/kpi.queries.server"

type KpiPeriodsListSectionProps = {
  periods: readonly KpiPeriodRow[]
  formatRange: (period: KpiPeriodRow) => string
}

export async function KpiPeriodsListSection({
  periods,
  formatRange,
}: KpiPeriodsListSectionProps) {
  const t = await getTranslations("Erp.Hrm.kpi")

  const listConfiguration = buildKpiPeriodsListSurfaceConfiguration(periods, {
    empty: t("periodsEmpty"),
    colName: t("fieldName"),
    colRange: t("fieldPeriodStart"),
    colState: t("goalStatus"),
    formatRange,
  })

  return (
    <GovernedPatternCListSection
      layout="embedded"
      title=""
      listConfiguration={listConfiguration}
      surfaceKey="hrm:kpi:periods"
    />
  )
}

type KpiScoresListSectionProps = {
  orgSlug: string
  scores: readonly KpiScoreListRow[]
  formatTargets: (score: KpiScoreListRow) => string
}

export async function KpiScoresListSection({
  orgSlug,
  scores,
  formatTargets,
}: KpiScoresListSectionProps) {
  const t = await getTranslations("Erp.Hrm.kpi")

  const listConfiguration = buildKpiScoresListSurfaceConfiguration(
    scores,
    orgSlug,
    {
      empty: t("scoresDescription"),
      colEmployee: t("fieldEmployee"),
      colMetric: t("fieldMetricCode"),
      colTargets: t("scoresTitle"),
      colAchievement: t("fieldAchievement"),
      formatTargets,
    }
  )

  return (
    <GovernedPatternCListSection
      layout="embedded"
      title=""
      listConfiguration={listConfiguration}
      surfaceKey="hrm:kpi:scores"
    />
  )
}
