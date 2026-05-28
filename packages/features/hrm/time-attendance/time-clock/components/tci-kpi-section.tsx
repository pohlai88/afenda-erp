import { getTranslations } from "next-intl/server"

import { GovernedPatternBStatSection } from "@afenda/governed-surface/server"

import { TimeClockKpiAttentionLinks } from "./tci-kpi-attention-links"
import {
  buildTimeClockKpiStatGroupConfigurations,
  TCI_STAT_SURFACE_KEY,
} from "../data/tci-surface-builders.server"
import type { TimeClockKpiSummary } from "../data/tci.queries.server"

const KPI_GROUP_KEYS = ["registry", "quality", "downstream"] as const

export async function TimeClockKpiSection({
  summary,
  loadError,
}: {
  summary: TimeClockKpiSummary
  loadError?: { title: string; description?: string }
}) {
  const t = await getTranslations("Erp.Hrm.timeClock.kpi")

  const groups = buildTimeClockKpiStatGroupConfigurations(summary, {
    registry: {
      activeDevices: t("activeDevices"),
      activeMappings: t("activeMappings"),
      punchesToday: t("punchesToday"),
      failedSync: t("failedSync"),
    },
    quality: {
      pendingExceptions: t("pendingExceptions"),
      missingPunchDays: t("missingPunchDays"),
      duplicatePunchInbox: t("duplicatePunchInbox"),
      abnormalPunchDays: t("abnormalPunchDays"),
      abnormalPunchInbox: t("abnormalPunchInbox"),
      correctionQueueOpen: t("correctionQueueOpen"),
    },
    downstream: {
      shiftEvaluatedToday: t("shiftEvaluatedToday"),
      lamExposedToday: t("lamExposedToday"),
      workHourDaysToday: t("workHourDaysToday"),
      payrollReadyDaysToday: t("payrollReadyDaysToday"),
    },
  })

  return (
    <div className="flex flex-col gap-3">
      <TimeClockKpiAttentionLinks summary={summary} />
      <GovernedPatternBStatSection
        surfaceKey={TCI_STAT_SURFACE_KEY}
        title={t("title")}
        loadError={
          loadError
            ? {
                variant: "error",
                title: loadError.title,
                description: loadError.description,
              }
            : undefined
        }
        statGroups={KPI_GROUP_KEYS.map((groupKey) => ({
          groupKey,
          label: t(`groups.${groupKey}`),
          configuration: groups[groupKey],
        }))}
        cardClassName="mt-0"
      />
    </div>
  )
}
