import { getFormatter, getTranslations } from "next-intl/server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import { buildRemoteCheckinHistoryListSurfaceConfiguration } from "../data/geolocation-surface-builders.server"
import {
  toGeolocationListLoadError,
  type GeolocationLoadError,
} from "../data/geolocation-load-error.shared"
import type { RemoteCheckinHistoryRow } from "../data/geolocation.queries.server"

export async function GeolocationHistorySection({
  orgSlug,
  rows,
  loadError,
}: {
  orgSlug: string
  rows: readonly RemoteCheckinHistoryRow[]
  loadError?: GeolocationLoadError
}) {
  const t = await getTranslations("Erp.Hrm.Geolocation.history")
  const format = await getFormatter()

  const listConfiguration = buildRemoteCheckinHistoryListSurfaceConfiguration(
    rows,
    orgSlug,
    {
      empty: t("empty"),
      colEmployee: t("colEmployee"),
      colEventType: t("colEvent"),
      colWhen: t("colWhen"),
      colLocation: t("colLocation"),
      colAccuracy: t("colAccuracy"),
      colGeofence: t("colGeofence"),
      formatWhen: (date) =>
        format.dateTime(date, { dateStyle: "medium", timeStyle: "short" }),
    }
  )

  return (
    <div id="geolocation-history-section">
      <GovernedPatternCListSection
        title={t("title")}
        description={t("description")}
        surfaceKey="hrm:geolocation:history"
        listConfiguration={listConfiguration}
        loadError={toGeolocationListLoadError(loadError)}
        resolveConfiguredPermission={false}
      />
    </div>
  )
}
