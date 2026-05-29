import { getTranslations } from "next-intl/server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"
import { logUnexpectedServerError } from "@afenda/platform/logger.server"
import { requireOrgSession } from "@afenda/platform/auth"
import { getOrganizationSlugById } from "@afenda/platform/auth/org-slug.server"

import { buildEmbeddedListSurfaceErrorConfiguration } from "../data/lam-embedded-list-surface-error.server"
import { buildTimeReportPendingListSurfaceConfiguration } from "../data/time-report-list-surface.server"
import { TIME_REPORT_LIST_SURFACE_IDS } from "../data/time-report-surface-metadata.shared"
import { listTimeReportsForOrg } from "../data/time-report.queries.server"

export async function AttendanceTimeReportPending() {
  const [orgSession, t, tAttendance] = await Promise.all([
    requireOrgSession(),
    getTranslations("Erp.Hrm.leave.timeReports"),
    getTranslations("Erp.Hrm.attendance"),
  ])

  let rows: Awaited<ReturnType<typeof listTimeReportsForOrg>>
  try {
    rows = await listTimeReportsForOrg(orgSession.organizationId, {
      states: ["submitted"],
      limit: 50,
    })
  } catch (err) {
    logUnexpectedServerError(
      "attendance-time-report-pending: query failed",
      err,
      {
        organizationId: orgSession.organizationId,
      }
    )
    return (
      <GovernedPatternCListSection
        layout="embedded"
        title=""
        listConfiguration={buildEmbeddedListSurfaceErrorConfiguration({
          columnsId: TIME_REPORT_LIST_SURFACE_IDS.pendingInbox,
          emptyTitle: t("inboxEmpty"),
          firstColumn: { id: "employee", header: tAttendance("colEmployee") },
        })}
        surfaceKey="hrm:attendance:time-report-pending:error"
        resolveConfiguredPermission={false}
        loadError={{
          variant: "error",
          title: t("inboxLoadFailed"),
        }}
      />
    )
  }

  const orgSlug =
    (await getOrganizationSlugById(orgSession.organizationId)) ?? ""

  const listConfiguration = buildTimeReportPendingListSurfaceConfiguration(
    rows,
    orgSlug,
    {
      empty: t("inboxEmpty"),
      colEmployee: tAttendance("colEmployee"),
      colReportType: t("colReportType"),
      colDetail: t("colDetail"),
      colRequested: t("colRequested"),
      reportKindLabelFor: () => t("reportKindTrip"),
    }
  )

  return (
    <GovernedPatternCListSection
      layout="embedded"
      title=""
      listConfiguration={listConfiguration}
      surfaceKey="hrm:attendance:time-report-pending"
      invalid={{
        variant: "error",
        title: t("inboxLoadFailed"),
      }}
    />
  )
}
