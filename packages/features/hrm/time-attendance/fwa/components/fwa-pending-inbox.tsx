import { getFormatter, getTranslations } from "next-intl/server"

import { matchesGovernedWorkbenchFocus } from "@afenda/governed-surface"
import { GovernedPatternCListSection } from "@afenda/governed-surface/server"
import { logUnexpectedServerError } from "@afenda/platform/logger.server"

import { formatFwaDateRange } from "../data/fwa-display.shared"
import { buildFwaPendingListSurfaceConfiguration } from "../data/fwa-surface-builders.server"
import { listFwaRequestsForOrg } from "../data/fwa.queries.server"
import { FWA_LIST_SURFACE_IDS } from "../data/fwa-surface-metadata.shared"
import { FwaDecisionTrailingCell } from "./fwa-decision-trailing-cell.client"

export async function FwaPendingInbox({
  orgSlug,
  organizationId,
  userId,
  canApproveAll,
  workbenchFocus,
}: {
  orgSlug: string
  organizationId: string
  userId: string
  canApproveAll: boolean
  workbenchFocus?: string | null
}) {
  const t = await getTranslations("Erp.Hrm.flexibleWork")
  const format = await getFormatter()

  let rows: Awaited<ReturnType<typeof listFwaRequestsForOrg>>
  try {
    rows = await listFwaRequestsForOrg(organizationId, {
      states: ["submitted"],
      limit: 100,
      assignedApproverUserId: canApproveAll ? undefined : userId,
    })
  } catch (err) {
    logUnexpectedServerError("fwa-pending-inbox: query failed", err, {
      organizationId,
    })
    return (
      <GovernedPatternCListSection
        layout="embedded"
        title=""
        listConfiguration={{
          dataNature: "table",
          surface: {
            header: { title: FWA_LIST_SURFACE_IDS.pendingInbox },
            columnsId: FWA_LIST_SURFACE_IDS.pendingInbox,
            rowKey: "id",
            empty: { variant: "muted", title: t("inboxEmpty") },
          },
          columns: [{ id: "employee", header: t("colEmployee") }],
          rows: [],
        }}
        surfaceKey="hrm:flexible-work:pending:error"
        resolveConfiguredPermission={false}
        loadError={{
          variant: "error",
          title: t("inboxLoadFailed"),
        }}
      />
    )
  }

  const filteredRows = rows.filter((row) =>
    matchesGovernedWorkbenchFocus(
      workbenchFocus,
      row.employeeFullName,
      row.employeeNumber,
      row.arrangementTypeLabel,
      row.arrangementTypeCode,
      row.startDate,
      row.endDate
    )
  )

  const listConfiguration = buildFwaPendingListSurfaceConfiguration(
    filteredRows,
    {
      columnsId: FWA_LIST_SURFACE_IDS.pendingInbox,
      empty: t("inboxEmpty"),
      colEmployee: t("colEmployee"),
      colType: t("colType"),
      colDates: t("colDates"),
      colState: t("colState"),
      colRequested: t("colRequested"),
      orgSlug,
      formatRequestedAt: (date) =>
        format.dateTime(date, { dateStyle: "medium", timeStyle: "short" }),
      stateLabelFor: (state) =>
        t(`stateLabels.${state}` as "stateLabels.submitted"),
    },
    {
      canApproveAll,
      currentUserId: userId,
      decideLabel: t("decideAction"),
      workbenchFocusSearch: {
        label: t("toolbarSearchLabel"),
        placeholder: t("toolbarSearchPlaceholder"),
        value: workbenchFocus,
      },
    }
  )

  return (
    <GovernedPatternCListSection
      layout="embedded"
      title={t("pendingTitle")}
      description={t("pendingDescription")}
      surfaceKey="hrm:flexible-work:pending"
      listConfiguration={listConfiguration}
      trailingColumn={{
        header: t("colActions"),
        Cell: FwaDecisionTrailingCell,
        context: {
          requests: filteredRows.map((row) => ({
            id: row.id,
            dateRange: formatFwaDateRange({
              startDate: row.startDate,
              endDate: row.endDate,
            }),
          })),
        },
      }}
    />
  )
}
