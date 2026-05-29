import { getFormatter, getTranslations } from "next-intl/server"

import { matchesGovernedWorkbenchFocus } from "@afenda/governed-surface"
import { GovernedPatternCListSection } from "@afenda/governed-surface/server"
import { logUnexpectedServerError } from "@afenda/platform/logger.server"

import { buildGeolocationEmbeddedListSurfaceErrorConfiguration } from "../data/geolocation-embedded-list-surface-error.server"
import { buildRemoteCheckinPendingListSurfaceConfiguration } from "../data/geolocation-surface-builders.server"
import { REMOTE_CHECKIN_LIST_SURFACE_IDS } from "../data/geolocation-surface-metadata.shared"
import { listRemoteCheckinExceptionsForOrg } from "../data/geolocation.queries.server"

import { GeolocationPendingTrailingCell } from "./geolocation-list-trailing-cells.client"

export async function GeolocationPendingInbox({
  organizationId,
  orgSlug,
  canDecide,
  workbenchFocus,
}: {
  organizationId: string
  orgSlug: string
  canDecide: boolean
  workbenchFocus?: string | null
}) {
  const t = await getTranslations("Erp.Hrm.Geolocation")
  const tOutcomes = await getTranslations("Erp.Hrm.Geolocation.outcomeLabels")
  const tPending = await getTranslations("Erp.Hrm.Geolocation.pending")
  const format = await getFormatter()

  let rows: Awaited<ReturnType<typeof listRemoteCheckinExceptionsForOrg>>
  try {
    rows = await listRemoteCheckinExceptionsForOrg(organizationId, {
      states: ["submitted", "returned"],
      limit: 100,
    })
  } catch (err) {
    logUnexpectedServerError("geolocation-pending-inbox: query failed", err, {
      organizationId,
    })
    return (
      <GovernedPatternCListSection
        layout="embedded"
        title=""
        listConfiguration={buildGeolocationEmbeddedListSurfaceErrorConfiguration(
          {
            columnsId: REMOTE_CHECKIN_LIST_SURFACE_IDS.pendingExceptions,
            emptyTitle: tPending("empty"),
            firstColumn: { id: "employee", header: tPending("colEmployee") },
          }
        )}
        surfaceKey="hrm:geolocation:pending:error"
        resolveConfiguredPermission={false}
        loadError={{
          variant: "error",
          title: tPending("loadFailed"),
        }}
      />
    )
  }

  const filteredRows = rows.filter((row) =>
    matchesGovernedWorkbenchFocus(
      workbenchFocus,
      row.employeeLegalName,
      row.employeeNumber,
      row.employeeId,
      row.eventType,
      row.detectionOutcome,
      row.reason
    )
  )

  const listConfiguration = buildRemoteCheckinPendingListSurfaceConfiguration(
    filteredRows,
    orgSlug,
    {
      empty: tPending("empty"),
      colEmployee: tPending("colEmployee"),
      colEventType: tPending("colEvent"),
      colWhen: tPending("colSubmittedAt"),
      colOutcome: tPending("colDetected"),
      colReason: tPending("colReason"),
      formatWhen: (date) =>
        format.dateTime(date, { dateStyle: "medium", timeStyle: "short" }),
      outcomeLabel: (outcome) =>
        tOutcomes(outcome as Parameters<typeof tOutcomes>[0]),
      decideLabel: t("decision.decideAction"),
    },
    {
      canDecide,
      workbenchFocusSearch: {
        label: t("pending.toolbarSearchLabel"),
        placeholder: t("pending.toolbarSearchPlaceholder"),
        value: workbenchFocus,
      },
    }
  )

  return (
    <GovernedPatternCListSection
      layout="embedded"
      title=""
      surfaceKey="hrm:geolocation:pending"
      listConfiguration={listConfiguration}
      trailingColumn={{
        header: tPending("colActions"),
        Cell: GeolocationPendingTrailingCell,
      }}
    />
  )
}
