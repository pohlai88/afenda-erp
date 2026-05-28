import { getTranslations } from "next-intl/server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"
import { logUnexpectedServerError } from "@afenda/platform/logger.server"
import { requireOrgSession } from "@afenda/platform/auth"
import { getOrganizationSlugById } from "@afenda/platform/auth/org-slug.server"

import { buildEmbeddedListSurfaceErrorConfiguration } from "../data/lam-embedded-list-surface-error.server"
import { buildTimeReportRecentListSurfaceConfiguration } from "../data/time-report-list-surface.server"
import { TIME_REPORT_LIST_SURFACE_IDS } from "../data/time-report-surface-metadata.shared"
import { listTimeReportsForOrg } from "../data/time-report.queries.server"

const RECENT_STATES = ["approved", "rejected", "cancelled"] as const

export async function AttendanceTimeReportRecent() {
  const [orgSession, t, tAttendance] = await Promise.all([
    requireOrgSession(),
    getTranslations("Erp.Hrm.leave.timeReports"),
    getTranslations("Erp.Hrm.attendance"),
  ])

  let rows: Awaited<ReturnType<typeof listTimeReportsForOrg>>
  try {
    rows = await listTimeReportsForOrg(orgSession.organizationId, {
      states: [...RECENT_STATES],
      limit: 50,
    })
  } catch (err) {
    logUnexpectedServerError(
      "attendance-time-report-recent: query failed",
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
          columnsId: TIME_REPORT_LIST_SURFACE_IDS.recent,
          emptyTitle: t("recentEmpty"),
          firstColumn: { id: "employee", header: tAttendance("colEmployee") },
        })}
        surfaceKey="hrm:attendance:time-report-recent:error"
        resolveConfiguredPermission={false}
        loadError={{
          variant: "error",
          title: t("recentLoadFailed"),
        }}
      />
    )
  }

  const stateLabelFor = (state: string) => {
    if (state === "submitted") return t("state.submitted")
    if (state === "approved") return t("state.approved")
    if (state === "rejected") return t("state.rejected")
    if (state === "cancelled") return t("state.cancelled")
    return state
  }

  const orgSlug =
    (await getOrganizationSlugById(orgSession.organizationId)) ?? ""

  const listConfiguration = buildTimeReportRecentListSurfaceConfiguration(
    rows,
    orgSlug,
    {
      empty: t("recentEmpty"),
      colEmployee: tAttendance("colEmployee"),
      colReportType: t("colReportType"),
      colDetail: t("colDetail"),
      colState: t("colState"),
      colUpdated: t("colUpdated"),
      reportKindLabelFor: () => t("reportKindTrip"),
      stateLabelFor,
    }
  )

  return (
    <GovernedPatternCListSection
      layout="embedded"
      title=""
      listConfiguration={listConfiguration}
      surfaceKey="hrm:attendance:time-report-recent"
      invalid={{
        variant: "error",
        title: t("recentLoadFailed"),
      }}
    />
  )
}
