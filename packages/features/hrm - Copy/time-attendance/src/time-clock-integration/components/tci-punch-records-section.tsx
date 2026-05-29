import { getTranslations } from "next-intl/server"

import { GovernedPatternBListSection } from "@afenda/governed-surface/server"

import { buildTimeClockPunchRecordsListSurfaceConfiguration } from "../data/tci-surface-builders.server"
import {
  toTimeClockListLoadError,
  type TimeClockLoadError,
} from "../data/tci-load-error.shared"
import type { TimeClockPunchRecordRow } from "../data/tci.queries.server"
import type { TciPunchEventType } from "../schemas/tci-workflow-state.shared"

export async function TimeClockPunchRecordsSection({
  rows,
  orgSlug,
  parentAccessAllowed = true,
  loadError,
}: {
  rows: readonly TimeClockPunchRecordRow[]
  orgSlug?: string
  parentAccessAllowed?: boolean
  loadError?: TimeClockLoadError
}) {
  const t = await getTranslations("Erp.Hrm.timeClock.punchRecords")
  const tClass = await getTranslations("Erp.Hrm.timeClock")

  const listConfiguration = buildTimeClockPunchRecordsListSurfaceConfiguration(
    rows,
    {
      empty: t("empty"),
      colOccurredAt: t("colOccurredAt"),
      colEmployee: t("colEmployee"),
      colDevice: t("colDevice"),
      colEventType: t("colEventType"),
      colSourceRef: t("colSourceRef"),
      formatEventType: (eventType) =>
        tClass(`classifiedEventTypeLabels.${eventType as TciPunchEventType}`),
    },
    { orgSlug }
  )

  return (
    <GovernedPatternBListSection
      title={t("title")}
      description={t("description")}
      surfaceKey="hrm:time-clock:punch-records"
      listConfiguration={listConfiguration}
      parentAccessAllowed={parentAccessAllowed}
      resolveConfiguredPermission={false}
      loadError={toTimeClockListLoadError(loadError)}
    />
  )
}
