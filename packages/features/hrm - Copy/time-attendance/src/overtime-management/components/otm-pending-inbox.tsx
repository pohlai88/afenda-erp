import { getFormatter, getTranslations } from "next-intl/server"

import { matchesGovernedWorkbenchFocus } from "@afenda/governed-surface"
import { GovernedPatternCListSection } from "@afenda/governed-surface/server"
import { logUnexpectedServerError } from "@afenda/platform/logger.server"

import { buildOtmEmbeddedListSurfaceErrorConfiguration } from "../data/otm-embedded-list-surface-error.server"
import { buildOtmPendingListSurfaceConfiguration } from "../data/otm-surface-builders.server"
import { getOtmDayCategoryLabelMap } from "../data/otm-section-labels.server"
import { listOtmRequestsForOrg } from "../data/otm.queries.server"
import { OTM_LIST_SURFACE_IDS } from "../data/otm-surface-metadata.shared"
import { OtmPendingBulkApproveToolbar } from "./otm-pending-bulk-approve.client"
import { OtmDecisionTrailingCell } from "./otm-decision-trailing-cell.client"

export async function OtmPendingInbox({
  organizationId,
  orgSlug,
  userId,
  canApproveAll,
  workbenchFocus,
}: {
  organizationId: string
  orgSlug: string
  userId: string
  canApproveAll: boolean
  workbenchFocus?: string | null
}) {
  const [t, format, dayCategoryLabels] = await Promise.all([
    getTranslations("Erp.Hrm.overtime"),
    getFormatter(),
    getOtmDayCategoryLabelMap(),
  ])

  let rows: Awaited<ReturnType<typeof listOtmRequestsForOrg>>
  try {
    rows = await listOtmRequestsForOrg(organizationId, {
      states: ["submitted"],
      limit: 100,
      assignedApproverUserId: canApproveAll ? undefined : userId,
    })
  } catch (err) {
    logUnexpectedServerError("otm-pending-inbox: query failed", err, {
      organizationId,
    })
    return (
      <GovernedPatternCListSection
        layout="embedded"
        title=""
        listConfiguration={buildOtmEmbeddedListSurfaceErrorConfiguration({
          columnsId: OTM_LIST_SURFACE_IDS.pendingInbox,
          emptyTitle: t("inboxEmpty"),
          firstColumn: { id: "employee", header: t("colEmployee") },
        })}
        surfaceKey="hrm:overtime:pending:error"
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
      row.employeeId,
      row.workDate,
      row.startTime,
      row.endTime,
      row.state
    )
  )

  const listConfiguration = buildOtmPendingListSurfaceConfiguration(
    filteredRows,
    {
      orgSlug,
      columnsId: OTM_LIST_SURFACE_IDS.pendingInbox,
      empty: t("inboxEmpty"),
      colEmployee: t("colEmployee"),
      colWorkDate: t("colWorkDate"),
      colTimeRange: t("colTimeRange"),
      colDuration: t("colDuration"),
      colDayCategory: t("colDayCategory"),
      colState: t("colState"),
      colRequested: t("colRequested"),
      dayCategoryLabels,
      formatRequestedAt: (date) =>
        format.dateTime(date, { dateStyle: "medium", timeStyle: "short" }),
      stateLabelFor: (state) =>
        t(`stateLabels.${state}` as "stateLabels.submitted"),
      approvalStageLabels: {
        manager: t("approvalStageManager"),
        hr: t("approvalStageHr"),
      },
    },
    {
      canApproveAll,
      currentUserId: userId,
      decideLabel: t("decideAction"),
      workbenchFocusSearch: {
        label: t("pendingToolbarSearchLabel"),
        placeholder: t("pendingToolbarSearchPlaceholder"),
        value: workbenchFocus,
      },
    }
  )

  const bulkRows = filteredRows.map((row) => ({
    id: row.id,
    label: `${row.employeeFullName ?? row.employeeId} · ${row.workDate} · ${row.startTime}–${row.endTime}`,
  }))

  return (
    <div className="flex flex-col gap-4">
      <OtmPendingBulkApproveToolbar rows={bulkRows} />
      <GovernedPatternCListSection
        layout="embedded"
        title={t("pendingTitle")}
        description={t("pendingDescription")}
        surfaceKey={OTM_LIST_SURFACE_IDS.pendingInbox}
        listConfiguration={listConfiguration}
        invalid={{
          variant: "error",
          title: t("inboxLoadFailed"),
        }}
        trailingColumn={{
          header: t("colActions"),
          Cell: OtmDecisionTrailingCell,
          context: {
            requests: filteredRows.map((row) => ({
              id: row.id,
              workDate: row.workDate,
              startTime: row.startTime,
              endTime: row.endTime,
              approvalStage: row.approvalStage,
            })),
          },
        }}
      />
    </div>
  )
}
