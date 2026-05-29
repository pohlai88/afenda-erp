import { getTranslations } from "next-intl/server"

import {
  buildGovernedListToolbarCanonicalHref,
  buildGovernedListToolbarSavedViewItems,
  governedListSectionAnchorHref,
  matchesGovernedWorkbenchFocus,
} from "@afenda/governed-surface"
import { GovernedPatternCListSection } from "@afenda/governed-surface/server"
import { RailSavedViewControls } from "../../_integration/rail-memory.client"
import { listSavedViewsForUser } from "../../_integration/rail-memory.server"
import { logUnexpectedServerError } from "@afenda/platform/logger.server"
import { requireOrgSession } from "@afenda/platform/auth"

import { buildEmbeddedListSurfaceErrorConfiguration } from "../data/lam-embedded-list-surface-error.server"
import { buildLeavePendingListSurfaceConfiguration } from "../data/leave-list-surface.server"
import { LEAVE_LIST_SURFACE_IDS } from "../data/leave-surface-metadata.shared"
import {
  buildLeavePendingListHref,
  LEAVE_PENDING_LIST_OWNED_PARAMS,
  type LeaveListUrlState,
} from "../data/leave-list-url-state.shared"
import {
  type OrgLeaveRequestRow,
  listAllLeaveRequestsForOrg,
} from "../data/leave-request.queries.server"
import { organizationHrmPath } from "@afenda/feature-hrm-core/shared"

import { LeaveDecisionTrailingCell } from "./leave-decision-trailing-cell.client"

export async function LeavePendingInbox({
  orgSlug,
  organizationId,
  userId,
  canApproveAll,
  listUrlState,
  workbenchFocus,
}: {
  orgSlug: string
  organizationId?: string
  userId?: string
  canApproveAll: boolean
  listUrlState?: LeaveListUrlState
  workbenchFocus?: string | null
}) {
  const [orgSession, t] = await Promise.all([
    requireOrgSession(),
    getTranslations("Erp.Hrm.leave"),
  ])
  const effectiveOrganizationId = organizationId ?? orgSession.organizationId
  const effectiveUserId = userId ?? orgSession.userId
  const effectiveListUrlState: LeaveListUrlState = listUrlState ?? {
    focus: workbenchFocus ?? null,
    pendingType: null,
    pendingSort: null,
  }

  let rows: OrgLeaveRequestRow[]
  try {
    rows = await listAllLeaveRequestsForOrg(effectiveOrganizationId, {
      states: ["submitted"],
      limit: 100,
      assignedApproverUserId: canApproveAll ? undefined : orgSession.userId,
    })
  } catch (err) {
    logUnexpectedServerError("leave-pending-inbox: query failed", err, {
      organizationId: effectiveOrganizationId,
    })
    return (
      <GovernedPatternCListSection
        layout="embedded"
        title=""
        listConfiguration={buildEmbeddedListSurfaceErrorConfiguration({
          columnsId: LEAVE_LIST_SURFACE_IDS.pending,
          emptyTitle: t("inboxEmpty"),
          firstColumn: { id: "employee", header: t("colEmployee") },
        })}
        surfaceKey="hrm:leave:pending:error"
        resolveConfiguredPermission={false}
        loadError={{
          variant: "error",
          title: t("inboxLoadFailed"),
        }}
      />
    )
  }

  const filteredRows: OrgLeaveRequestRow[] = Array.from(rows)
    .filter((row) =>
      matchesGovernedWorkbenchFocus(
        effectiveListUrlState.focus,
        row.employeeFullName,
        row.employeeNumber,
        row.leaveTypeCode,
        row.startDate,
        row.endDate,
        row.state
      )
    )
    .filter((row) => {
      const pendingType = effectiveListUrlState.pendingType
      return !pendingType || pendingType === "all"
        ? true
        : (row.leaveTypeCode ?? "—") === pendingType
    })
    .sort((a, b) => {
      if (effectiveListUrlState.pendingSort === "employee-asc") {
        return (a.employeeFullName ?? a.employeeId).localeCompare(
          b.employeeFullName ?? b.employeeId
        )
      }
      return b.requestedAt.getTime() - a.requestedAt.getTime()
    })
  const sectionHash = governedListSectionAnchorHref("hrm:leave:pending-inbox")
  const currentHref = buildGovernedListToolbarCanonicalHref({
    currentHref: buildLeavePendingListHref(
      organizationHrmPath(orgSlug, "leave"),
      effectiveListUrlState
    ),
    ownedParams: LEAVE_PENDING_LIST_OWNED_PARAMS,
    hash: sectionHash,
  })
  const savedViews = await listSavedViewsForUser({
    organizationId: effectiveOrganizationId,
    userId: effectiveUserId,
    surfaceId: "hrm",
  })
  const savedViewItems = buildGovernedListToolbarSavedViewItems({
    views: savedViews,
    currentHref,
    ownedParams: LEAVE_PENDING_LIST_OWNED_PARAMS,
    sectionHash,
  })

  const listConfiguration = buildLeavePendingListSurfaceConfiguration(
    filteredRows,
    {
      empty: t("inboxEmpty"),
      colEmployee: t("colEmployee"),
      colLeaveType: t("colLeaveType"),
      colDates: t("colDates"),
      colDuration: t("colDuration"),
      colRequested: t("colRequested"),
    },
    {
      orgSlug,
      canApproveAll,
      currentUserId: orgSession.userId,
      workbenchFocusSearch: {
        label: t("toolbarSearchLabel"),
        placeholder: t("toolbarSearchPlaceholder"),
        value: effectiveListUrlState.focus,
      },
      pendingType: effectiveListUrlState.pendingType,
      pendingSort: effectiveListUrlState.pendingSort,
      savedViewItems,
    }
  )

  return (
    <GovernedPatternCListSection
      layout="embedded"
      title=""
      listConfiguration={listConfiguration}
      surfaceKey="hrm:leave:pending-inbox"
      invalid={{
        variant: "error",
        title: t("inboxLoadFailed"),
      }}
      headerSlot={
        <div className="mb-2 flex justify-end">
          <RailSavedViewControls
            surfaceId="hrm"
            currentHref={currentHref}
            views={savedViewItems}
          />
        </div>
      }
      trailingColumn={{
        header: t("colActions"),
        Cell: LeaveDecisionTrailingCell,
        context: {
          requests: filteredRows.map((row) => ({
            id: row.id,
            startDate: row.startDate,
            endDate: row.endDate,
          })),
        },
      }}
    />
  )
}
