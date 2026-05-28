import { getTranslations } from "next-intl/server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import { buildGeofencesListSurfaceConfiguration } from "../data/geolocation-surface-builders.server"
import {
  toGeolocationListLoadError,
  type GeolocationLoadError,
} from "../data/geolocation-load-error.shared"
import type { GeofenceRow } from "../data/geolocation.queries.server"
import type { GeofenceScopeKind } from "../schemas/geolocation-workflow-state.shared"
import { GeofenceUpsertDialog } from "./geofence-form.client"
import { GeolocationGeofenceTrailingCell } from "./geolocation-list-trailing-cells.client"

const GEOFENCE_FORM_SCOPE_KINDS = [
  "office",
  "branch",
  "project_site",
  "client_site",
  "field_site",
  "home_office",
] as const

type GeofenceFormScopeKind = (typeof GEOFENCE_FORM_SCOPE_KINDS)[number]

function toFormScopeKind(value: GeofenceScopeKind): GeofenceFormScopeKind {
  return (GEOFENCE_FORM_SCOPE_KINDS as readonly string[]).includes(value)
    ? (value as GeofenceFormScopeKind)
    : "office"
}

export async function GeolocationGeofencesSection({
  orgSlug,
  rows,
  canManage,
  loadError,
}: {
  orgSlug: string
  rows: readonly GeofenceRow[]
  canManage: boolean
  loadError?: GeolocationLoadError
}) {
  const t = await getTranslations("Erp.Hrm.Geolocation.geofences")
  const tCommon = await getTranslations("Erp.Hrm.Geolocation")

  const yesNo = (value: boolean) => (value ? tCommon("yes") : tCommon("no"))

  const listConfiguration = buildGeofencesListSurfaceConfiguration(
    rows,
    {
      empty: t("empty"),
      colCode: t("colCode"),
      colLabel: t("colLabel"),
      colScope: t("colScope"),
      colCenter: t("colCenter"),
      colRadius: t("colRadius"),
      colArchived: t("colActive"),
      yesNo: (value) => yesNo(!value),
      editLabel: t("editOpen"),
    },
    { canManage }
  )

  return (
    <GovernedPatternCListSection
      title={t("title")}
      description={t("description")}
      surfaceKey="hrm:geolocation:geofences"
      listConfiguration={listConfiguration}
      loadError={toGeolocationListLoadError(loadError)}
      headerSlot={
        canManage ? (
          <div className="flex justify-end">
            <GeofenceUpsertDialog orgSlug={orgSlug} mode="create" />
          </div>
        ) : null
      }
      trailingColumn={{
        header: t("colLabel"),
        Cell: GeolocationGeofenceTrailingCell,
        context: {
          orgSlug,
          rows: rows.map((row) => ({
            id: row.id,
            archivedAt: row.archivedAt?.toISOString() ?? null,
            defaults: {
              geofenceId: row.id,
              code: row.code,
              label: row.label,
              scopeKind: toFormScopeKind(row.scopeKind),
              latitude: row.latitude,
              longitude: row.longitude,
              radiusMeters: row.radiusMeters,
              bufferMeters: row.bufferMeters,
              countryCode: row.countryCode,
              legalEntityCode: row.legalEntityCode,
              notes: row.notes,
            },
          })),
        },
      }}
    />
  )
}
