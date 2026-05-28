import { getTranslations } from "next-intl/server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"
import { buildTimeClockDevicesListSurfaceConfiguration } from "../data/tci-surface-builders.server"
import {
  toTimeClockListLoadError,
  type TimeClockLoadError,
} from "../data/tci-load-error.shared"
import type { TimeClockDeviceRow } from "../data/tci.queries.server"
import type {
  TciDeviceState,
  TciDeviceSyncStatus,
  TciDeviceType,
} from "../schemas/tci-workflow-state.shared"

import { TimeClockDeviceRegisterDialog } from "./tci-device-forms.client"
import { TciDeviceTrailingCell } from "./tci-list-trailing-cells.client"
import { TimeClockMobileClockNotice } from "./tci-mobile-clock-notice"

export async function TimeClockDevicesSection({
  rows,
  canManage,
  orgSlug,
  mobileClockEnabled = false,
  parentAccessAllowed = true,
  loadError,
}: {
  rows: readonly TimeClockDeviceRow[]
  canManage: boolean
  orgSlug?: string
  mobileClockEnabled?: boolean
  parentAccessAllowed?: boolean
  loadError?: TimeClockLoadError
}) {
  const t = await getTranslations("Erp.Hrm.timeClock.devices")

  const listConfiguration = buildTimeClockDevicesListSurfaceConfiguration(
    rows,
    {
      empty: t("empty"),
      colDeviceId: t("colDeviceId"),
      colName: t("colName"),
      colType: t("colType"),
      colLocation: t("colLocation"),
      colStatus: t("colStatus"),
      colSync: t("colSync"),
      colLastSync: t("colLastSync"),
      formatDeviceType: (deviceType) =>
        t(`deviceTypeLabels.${deviceType as TciDeviceType}`),
      formatDeviceState: (state) =>
        t(`registryStateLabels.${state as TciDeviceState}`),
      formatSyncStatus: (syncStatus) =>
        t(`syncStatusLabels.${syncStatus as TciDeviceSyncStatus}`),
      manageActionsLabel: t("manageActions"),
    },
    { canManage }
  )

  const deviceSeeds = rows.map((row) => ({
    id: row.id,
    externalDeviceId: row.externalDeviceId,
    name: row.name,
    deviceType: row.deviceType,
    locationRef: row.locationRef,
    integrationCredentialRef: row.integrationCredentialRef,
    state:
      row.state === "inactive" ? ("inactive" as const) : ("active" as const),
    registryState: row.state,
  }))

  return (
    <div className="flex flex-col gap-4">
      {orgSlug ? (
        <TimeClockMobileClockNotice
          orgSlug={orgSlug}
          enabled={mobileClockEnabled}
        />
      ) : null}
      <GovernedPatternCListSection
        title={t("title")}
        description={t("description")}
        surfaceKey="hrm:time-clock:devices"
        listConfiguration={listConfiguration}
        parentAccessAllowed={parentAccessAllowed}
        resolveConfiguredPermission={false}
        loadError={toTimeClockListLoadError(loadError)}
        headerSlot={
          canManage ? (
            <div className="flex justify-end">
              <TimeClockDeviceRegisterDialog />
            </div>
          ) : null
        }
        trailingColumn={{
          header: t("colActions"),
          Cell: TciDeviceTrailingCell,
          context: { canManage, devices: deviceSeeds },
        }}
      />
    </div>
  )
}
