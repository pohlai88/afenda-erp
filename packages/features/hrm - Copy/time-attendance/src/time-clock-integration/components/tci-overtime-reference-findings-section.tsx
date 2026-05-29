import { getTranslations } from "next-intl/server"

import { GovernedPatternBListSection } from "@afenda/governed-surface/server"

import { buildTimeClockOvertimeReferenceFindingsListSurfaceConfiguration } from "../data/tci-surface-builders.server"
import {
  toTimeClockListLoadError,
  type TimeClockLoadError,
} from "../data/tci-load-error.shared"
import type { TimeClockOvertimeReferenceRow } from "../data/tci-overtime-reference.server"
import type { TciOtmWorkHourExposureStatus } from "../tci-overtime-reference.shared"

export async function TimeClockOvertimeReferenceFindingsSection({
  rows,
  orgSlug,
  parentAccessAllowed = true,
  loadError,
}: {
  rows: readonly TimeClockOvertimeReferenceRow[]
  orgSlug?: string
  parentAccessAllowed?: boolean
  loadError?: TimeClockLoadError
}) {
  const t = await getTranslations("Erp.Hrm.timeClock.overtimeReferenceFindings")
  const tExposure = await getTranslations(
    "Erp.Hrm.timeClock.otmWorkHourExposureStatusLabels"
  )

  const listConfiguration =
    buildTimeClockOvertimeReferenceFindingsListSurfaceConfiguration(
      rows,
      {
        empty: t("empty"),
        colDate: t("colDate"),
        colEmployee: t("colEmployee"),
        colWorkedMinutes: t("colWorkedMinutes"),
        colOvertimeMinutes: t("colOvertimeMinutes"),
        colExposure: t("colExposure"),
        formatExposure: (status) =>
          tExposure(status as TciOtmWorkHourExposureStatus),
      },
      { orgSlug }
    )

  return (
    <GovernedPatternBListSection
      title={t("title")}
      description={t("description")}
      surfaceKey="hrm:time-clock:overtime-reference-findings"
      listConfiguration={listConfiguration}
      parentAccessAllowed={parentAccessAllowed}
      resolveConfiguredPermission={false}
      loadError={toTimeClockListLoadError(loadError)}
    />
  )
}
