import { getTranslations } from "next-intl/server"

import { GovernedPatternBListSection } from "@afenda/governed-surface/server"

import { buildTimeClockAttendanceHandoffFindingsListSurfaceConfiguration } from "../data/tci-surface-builders.server"
import {
  toTimeClockListLoadError,
  type TimeClockLoadError,
} from "../data/tci-load-error.shared"
import type { TimeClockAttendanceHandoffRow } from "../data/tci-attendance-handoff.server"
import type { TciLamExposureStatus } from "../tci-attendance-handoff.shared"

export async function TimeClockAttendanceHandoffFindingsSection({
  rows,
  orgSlug,
  parentAccessAllowed = true,
  loadError,
}: {
  rows: readonly TimeClockAttendanceHandoffRow[]
  orgSlug?: string
  parentAccessAllowed?: boolean
  loadError?: TimeClockLoadError
}) {
  const t = await getTranslations("Erp.Hrm.timeClock.attendanceHandoffFindings")
  const tExposure = await getTranslations(
    "Erp.Hrm.timeClock.lamExposureStatusLabels"
  )

  const listConfiguration =
    buildTimeClockAttendanceHandoffFindingsListSurfaceConfiguration(
      rows,
      {
        empty: t("empty"),
        colDate: t("colDate"),
        colEmployee: t("colEmployee"),
        colPunches: t("colPunches"),
        colWorkedMinutes: t("colWorkedMinutes"),
        colExposure: t("colExposure"),
        formatExposure: (status) => tExposure(status as TciLamExposureStatus),
      },
      { orgSlug }
    )

  return (
    <GovernedPatternBListSection
      title={t("title")}
      description={t("description")}
      surfaceKey="hrm:time-clock:attendance-handoff-findings"
      listConfiguration={listConfiguration}
      parentAccessAllowed={parentAccessAllowed}
      resolveConfiguredPermission={false}
      loadError={toTimeClockListLoadError(loadError)}
    />
  )
}
