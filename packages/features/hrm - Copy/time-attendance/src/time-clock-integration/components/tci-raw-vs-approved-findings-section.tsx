import { getTranslations } from "next-intl/server"

import { GovernedPatternBListSection } from "@afenda/governed-surface/server"

import { buildTimeClockRawVsApprovedFindingsListSurfaceConfiguration } from "../data/tci-surface-builders.server"
import {
  toTimeClockListLoadError,
  type TimeClockLoadError,
} from "../data/tci-load-error.shared"
import { HRM_ATTENDANCE_DAY_STATES } from "../../leave-attendance-management/schemas/hrm-workflow-state.shared"
import type { TimeClockRawVsApprovedRow } from "../data/tci-raw-vs-approved.server"
import type { TciRawVsApprovedRelationship } from "../tci-raw-vs-approved.shared"

function formatLamDayStateLabel(
  state: string | null,
  translate: (key: "none" | "open" | "computed" | "locked") => string
): string {
  if (state == null) return translate("none")
  if ((HRM_ATTENDANCE_DAY_STATES as readonly string[]).includes(state)) {
    return translate(state as "open" | "computed" | "locked")
  }
  return state
}

export async function TimeClockRawVsApprovedFindingsSection({
  rows,
  orgSlug,
  parentAccessAllowed = true,
  loadError,
}: {
  rows: readonly TimeClockRawVsApprovedRow[]
  orgSlug?: string
  parentAccessAllowed?: boolean
  loadError?: TimeClockLoadError
}) {
  const t = await getTranslations("Erp.Hrm.timeClock.rawVsApprovedFindings")
  const tRelationship = await getTranslations(
    "Erp.Hrm.timeClock.rawVsApprovedRelationshipLabels"
  )
  const tLamState = await getTranslations("Erp.Hrm.timeClock.lamDayStateLabels")

  const listConfiguration =
    buildTimeClockRawVsApprovedFindingsListSurfaceConfiguration(
      rows,
      {
        empty: t("empty"),
        colDate: t("colDate"),
        colEmployee: t("colEmployee"),
        colRawPunches: t("colRawPunches"),
        colLamState: t("colLamState"),
        colWorkedMinutes: t("colWorkedMinutes"),
        colRelationship: t("colRelationship"),
        formatRelationship: (relationship) =>
          tRelationship(relationship as TciRawVsApprovedRelationship),
        formatLamState: (state) => formatLamDayStateLabel(state, tLamState),
      },
      { orgSlug }
    )

  return (
    <GovernedPatternBListSection
      title={t("title")}
      description={t("description")}
      surfaceKey="hrm:time-clock:raw-vs-approved-findings"
      listConfiguration={listConfiguration}
      parentAccessAllowed={parentAccessAllowed}
      resolveConfiguredPermission={false}
      loadError={toTimeClockListLoadError(loadError)}
    />
  )
}
