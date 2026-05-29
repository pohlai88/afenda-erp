import { getTranslations } from "next-intl/server"

import { GovernedPatternBListSection } from "@afenda/governed-surface/server"

import { buildTimeClockShiftMatchFindingsListSurfaceConfiguration } from "../data/tci-surface-builders.server"
import {
  toTimeClockListLoadError,
  type TimeClockLoadError,
} from "../data/tci-load-error.shared"
import type { TimeClockShiftMatchRow } from "../data/tci-shift-matching.server"
import type { TciPunchEventType } from "../schemas/tci-workflow-state.shared"
import type { TciShiftMatchStatus } from "../tci-shift-matching.shared"

export async function TimeClockShiftMatchFindingsSection({
  rows,
  orgSlug,
  parentAccessAllowed = true,
  loadError,
}: {
  rows: readonly TimeClockShiftMatchRow[]
  orgSlug?: string
  parentAccessAllowed?: boolean
  loadError?: TimeClockLoadError
}) {
  const t = await getTranslations("Erp.Hrm.timeClock.shiftMatchFindings")
  const tStatus = await getTranslations(
    "Erp.Hrm.timeClock.shiftMatchStatusLabels"
  )
  const tClass = await getTranslations("Erp.Hrm.timeClock")

  const listConfiguration =
    buildTimeClockShiftMatchFindingsListSurfaceConfiguration(
      rows,
      {
        empty: t("empty"),
        colOccurredAt: t("colOccurredAt"),
        colEmployee: t("colEmployee"),
        colEventType: t("colEventType"),
        colShiftWindow: t("colShiftWindow"),
        colMatchStatus: t("colMatchStatus"),
        formatMatchStatus: (status) => tStatus(status as TciShiftMatchStatus),
        formatEventType: (eventType) =>
          tClass(`classifiedEventTypeLabels.${eventType as TciPunchEventType}`),
      },
      { orgSlug }
    )

  return (
    <GovernedPatternBListSection
      title={t("title")}
      description={t("description")}
      surfaceKey="hrm:time-clock:shift-match-findings"
      listConfiguration={listConfiguration}
      parentAccessAllowed={parentAccessAllowed}
      resolveConfiguredPermission={false}
      loadError={toTimeClockListLoadError(loadError)}
    />
  )
}
