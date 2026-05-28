import { getFormatter, getTranslations } from "next-intl/server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import { buildRemoteCheckinDevicesListSurfaceConfiguration } from "../data/geolocation-surface-builders.server"
import {
  toGeolocationListLoadError,
  type GeolocationLoadError,
} from "../data/geolocation-load-error.shared"
import type { RemoteCheckinDeviceRow } from "../data/geolocation.queries.server"

import { RemoteCheckinDeviceRegisterDialog } from "./remote-checkin-device-forms.client"
import { GeolocationDeviceTrailingCell } from "./geolocation-list-trailing-cells.client"

export async function GeolocationDevicesSection({
  orgSlug,
  rows,
  canManage,
  employeeChoices,
  loadError,
}: {
  orgSlug: string
  rows: readonly RemoteCheckinDeviceRow[]
  canManage: boolean
  employeeChoices: ReadonlyArray<{ id: string; label: string }>
  loadError?: GeolocationLoadError
}) {
  const t = await getTranslations("Erp.Hrm.Geolocation.devices")
  const format = await getFormatter()

  const listConfiguration = buildRemoteCheckinDevicesListSurfaceConfiguration(
    rows,
    orgSlug,
    {
      empty: t("empty"),
      colEmployee: t("colEmployee"),
      colLabel: t("colLabel"),
      colState: t("colState"),
      colLastSeen: t("colLastSeen"),
      colCreated: t("colLastSeen"),
      formatLastSeen: (date) =>
        date
          ? format.dateTime(date, { dateStyle: "medium", timeStyle: "short" })
          : "—",
      formatCreated: (date) => format.dateTime(date, { dateStyle: "medium" }),
      revokeLabel: t("revokeOpen"),
      reinstateLabel: t("registerOpen"),
    },
    { canManage }
  )

  return (
    <GovernedPatternCListSection
      title={t("title")}
      description={t("description")}
      surfaceKey="hrm:geolocation:devices"
      listConfiguration={listConfiguration}
      loadError={toGeolocationListLoadError(loadError)}
      headerSlot={
        canManage ? (
          <div className="flex justify-end">
            <RemoteCheckinDeviceRegisterDialog
              orgSlug={orgSlug}
              employees={employeeChoices}
            />
          </div>
        ) : null
      }
      trailingColumn={{
        header: t("colActions"),
        Cell: GeolocationDeviceTrailingCell,
        context: {
          devices: rows.map((row) => ({
            id: row.id,
            deviceLabel: row.deviceLabel,
          })),
        },
      }}
    />
  )
}
