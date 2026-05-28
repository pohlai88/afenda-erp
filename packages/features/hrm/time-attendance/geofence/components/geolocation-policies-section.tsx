import { getTranslations } from "next-intl/server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import {
  listDepartmentsForOrg,
  listPositionsForOrg,
} from "../../../employees/server"
import { buildRemoteCheckinPoliciesListSurfaceConfiguration } from "../data/geolocation-surface-builders.server"
import {
  toGeolocationListLoadError,
  type GeolocationLoadError,
} from "../data/geolocation-load-error.shared"
import type { RemoteCheckinPolicyRow } from "../data/geolocation.queries.server"

import { RemoteCheckinPolicyDialog } from "./remote-checkin-policy-form.client"
import { GeolocationPolicyTrailingCell } from "./geolocation-list-trailing-cells.client"

const POLICY_FORM_SCOPES = [
  "org",
  "department",
  "position",
  "employment_type",
  "policy_group",
  "employee",
] as const

type PolicyFormScope = (typeof POLICY_FORM_SCOPES)[number]

function toFormScope(value: string): PolicyFormScope {
  return (POLICY_FORM_SCOPES as readonly string[]).includes(value)
    ? (value as PolicyFormScope)
    : "org"
}

export async function GeolocationPoliciesSection({
  orgSlug,
  organizationId,
  rows,
  canManage,
  employeeChoices = [],
  loadError,
}: {
  orgSlug: string
  organizationId: string
  rows: readonly RemoteCheckinPolicyRow[]
  canManage: boolean
  employeeChoices?: ReadonlyArray<{
    readonly id: string
    readonly label: string
  }>
  loadError?: GeolocationLoadError
}) {
  const t = await getTranslations("Erp.Hrm.Geolocation.policies")
  const tCommon = await getTranslations("Erp.Hrm.Geolocation")
  const yesNo = (value: boolean) => (value ? tCommon("yes") : tCommon("no"))

  const listConfiguration = buildRemoteCheckinPoliciesListSurfaceConfiguration(
    rows,
    {
      empty: t("empty"),
      colScope: t("fieldScopeKind"),
      colMinAccuracy: t("fieldMinGpsAccuracyMeters"),
      colShiftWindow: t("fieldShiftWindowMinutes"),
      colDevice: t("fieldRequireRegisteredDevice"),
      colSelfie: t("fieldRequireSelfie"),
      colSpoof: t("fieldDetectSpoofing"),
      colActive: t("fieldIsActive"),
      yesNo,
      editLabel: t("editOpen"),
    },
    { canManage }
  )

  const scopeRefChoices = canManage
    ? await (async () => {
        const [departments, positions] = await Promise.all([
          listDepartmentsForOrg(organizationId, { includeArchived: false }),
          listPositionsForOrg(organizationId, { includeArchived: false }),
        ])
        return {
          employees: employeeChoices,
          departments: departments.map((row) => ({
            id: row.id,
            label: row.name,
          })),
          positions: positions.map((row) => ({
            id: row.id,
            label: row.title,
          })),
        }
      })()
    : undefined

  return (
    <GovernedPatternCListSection
      title={t("title")}
      description={t("description")}
      surfaceKey="hrm:geolocation:policies"
      listConfiguration={listConfiguration}
      loadError={toGeolocationListLoadError(loadError)}
      headerSlot={
        canManage ? (
          <div className="flex justify-end">
            <RemoteCheckinPolicyDialog
              orgSlug={orgSlug}
              mode="create"
              scopeRefChoices={scopeRefChoices}
            />
          </div>
        ) : null
      }
      trailingColumn={{
        header: t("editOpen"),
        Cell: GeolocationPolicyTrailingCell,
        context: {
          orgSlug,
          scopeRefChoices,
          rows: rows.map((row) => ({
            id: row.id,
            defaults: {
              policyId: row.id,
              scopeKind: toFormScope(row.scopeKind),
              scopeRef: row.scopeRef,
              minGpsAccuracyMeters: row.minGpsAccuracyMeters,
              allowedRadiusBufferMeters: row.allowedRadiusBufferMeters,
              shiftWindowMinutes: row.shiftWindowMinutes,
              breakWindowMinutes: row.breakWindowMinutes,
              requireRegisteredDevice: row.requireRegisteredDevice,
              requireSelfie: row.requireSelfie,
              detectSpoofing: row.detectSpoofing,
              allowEligibilityException: row.allowEligibilityException,
              isActive: row.isActive,
            },
          })),
        },
      }}
    />
  )
}
