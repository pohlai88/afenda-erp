import { getTranslations } from "next-intl/server"

import { GovernedPatternBStatSection } from "@afenda/governed-surface/server"

import {
  REMOTE_CHECKIN_STAT_SURFACE_KEY,
  buildRemoteCheckinKpiStatConfiguration,
} from "../data/geolocation-surface-builders.server"
import type { RemoteCheckinKpiSummary } from "../data/geolocation.queries.server"
import type { GeolocationLoadError } from "../data/geolocation-load-error.shared"

export async function GeolocationKpiSummarySection({
  summary,
  loadError,
}: {
  summary: RemoteCheckinKpiSummary
  loadError?: GeolocationLoadError
}) {
  const t = await getTranslations("Erp.Hrm.Geolocation.kpi")

  const configuration = buildRemoteCheckinKpiStatConfiguration(summary, {
    verifiedToday: t("verifiedToday"),
    pendingExceptions: t("pendingExceptions"),
    outsideGeofence: t("outsideGeofence"),
    weakAccuracy: t("weakAccuracy"),
    activeGeofences: t("activeGeofences"),
    registeredDevices: t("registeredDevices"),
  })

  return (
    <GovernedPatternBStatSection
      title={t("title")}
      surfaceKey={REMOTE_CHECKIN_STAT_SURFACE_KEY}
      loadError={
        loadError
          ? {
              variant: "error",
              title: loadError.title,
              description: loadError.description,
            }
          : undefined
      }
      statGroups={[
        {
          groupKey: "summary",
          configuration,
        },
      ]}
    />
  )
}
