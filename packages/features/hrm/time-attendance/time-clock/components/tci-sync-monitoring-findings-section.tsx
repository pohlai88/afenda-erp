import { getTranslations } from "next-intl/server"

import { GovernedPatternBListSection } from "@afenda/governed-surface/server"

import { buildTimeClockSyncMonitoringFindingsListSurfaceConfiguration } from "../data/tci-surface-builders.server"
import {
  toTimeClockListLoadError,
  type TimeClockLoadError,
} from "../data/tci-load-error.shared"
import type { TciDeviceType } from "../schemas/tci-workflow-state.shared"
import type { TimeClockSyncMonitoringRow } from "../data/tci-sync-monitoring.server"
import type { TciSyncMonitoringAttentionKind } from "../tci-sync-monitoring.shared"

export async function TimeClockSyncMonitoringFindingsSection({
  rows,
  parentAccessAllowed = true,
  loadError,
  workbenchFocus,
}: {
  rows: readonly TimeClockSyncMonitoringRow[]
  parentAccessAllowed?: boolean
  loadError?: TimeClockLoadError
  workbenchFocus?: string | null
}) {
  const t = await getTranslations("Erp.Hrm.timeClock.syncMonitoringFindings")
  const tAttention = await getTranslations(
    "Erp.Hrm.timeClock.syncMonitoringAttentionLabels"
  )
  const tClock = await getTranslations("Erp.Hrm.timeClock")

  const listConfiguration =
    buildTimeClockSyncMonitoringFindingsListSurfaceConfiguration(
      rows,
      {
        empty: t("empty"),
        colDevice: t("colDevice"),
        colExternalId: t("colExternalId"),
        colType: t("colType"),
        colLocation: t("colLocation"),
        colSyncStatus: t("colSyncStatus"),
        colLastSync: t("colLastSync"),
        colAttention: t("colAttention"),
        formatAttention: (kind) =>
          tAttention(kind as TciSyncMonitoringAttentionKind),
        formatDeviceType: (deviceType) =>
          tClock(`devices.deviceTypeLabels.${deviceType as TciDeviceType}`),
      },
      {
        workbenchFocusSearch: {
          label: t("toolbarSearchLabel"),
          placeholder: t("toolbarSearchPlaceholder"),
          value: workbenchFocus,
        },
      }
    )

  return (
    <GovernedPatternBListSection
      title={t("title")}
      description={t("description")}
      surfaceKey="hrm:time-clock:sync-monitoring-findings"
      listConfiguration={listConfiguration}
      parentAccessAllowed={parentAccessAllowed}
      resolveConfiguredPermission={false}
      loadError={toTimeClockListLoadError(loadError)}
    />
  )
}
