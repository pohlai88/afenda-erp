import { getFormatter, getTranslations } from "next-intl/server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import { buildKpiGoalsListSurfaceConfiguration } from "../data/kpi-goals-list-surface.server"
import type { KpiGoalRow } from "../data/kpi-goal.queries.server"
import type { KpiGoalListGoalStatusFilter } from "./kpi-goal-list"

type KpiGoalsListSectionProps = {
  orgSlug: string
  goals: readonly KpiGoalRow[]
  goalStatus: KpiGoalListGoalStatusFilter
}

export async function KpiGoalsListSection({
  orgSlug,
  goals,
  goalStatus,
}: KpiGoalsListSectionProps) {
  const [t, format] = await Promise.all([
    getTranslations("Erp.Hrm.kpi"),
    getFormatter(),
  ])

  const listConfiguration = buildKpiGoalsListSurfaceConfiguration(
    goals,
    orgSlug,
    {
      empty: t("goalsEmpty"),
      colTitle: t("goalFieldTitle"),
      colOwner: t("goalOwner"),
      colStatus: t("goalStatus"),
      colDue: t("goalDue"),
      colProgress: t("goalPercent"),
      formatDue: (dueDate) => format.dateTime(dueDate, { dateStyle: "medium" }),
    },
    goalStatus === "all" ? undefined : goalStatus
  )

  return (
    <GovernedPatternCListSection
      layout="embedded"
      title={t("goalsTitle")}
      description={t("goalsDescription")}
      listConfiguration={listConfiguration}
      surfaceKey="hrm:kpi-goals"
    />
  )
}
