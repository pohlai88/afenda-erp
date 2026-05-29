import { getTranslations } from "next-intl/server"

import { matchesGovernedWorkbenchFocus } from "@afenda/governed-surface"
import { GovernedPatternCListSection } from "@afenda/governed-surface/server"
import { logUnexpectedServerError } from "@afenda/platform/logger.server"

import { buildOtmEmbeddedListSurfaceErrorConfiguration } from "../data/otm-embedded-list-surface-error.server"
import { buildOtmExceptionInboxListSurfaceConfiguration } from "../data/otm-surface-builders.server"
import { formatOvertimeDurationMinutes } from "../data/otm-display.shared"
import { listPendingOtmExceptionsForOrg } from "../data/otm-exception.server"
import { getOtmExceptionTypeLabelMap } from "../data/otm-section-labels.server"
import { OTM_LIST_SURFACE_IDS } from "../data/otm-surface-metadata.shared"
import { OtmExceptionDecisionTrailingCell } from "./otm-exception-decision-trailing-cell.client"

export async function OtmExceptionInbox({
  organizationId,
  orgSlug,
  workbenchFocus,
}: {
  organizationId: string
  orgSlug: string
  workbenchFocus?: string | null
}) {
  const [t, exceptionTypeLabels] = await Promise.all([
    getTranslations("Erp.Hrm.overtime"),
    getOtmExceptionTypeLabelMap(),
  ])

  let rows: Awaited<ReturnType<typeof listPendingOtmExceptionsForOrg>>
  try {
    rows = await listPendingOtmExceptionsForOrg(organizationId)
  } catch (err) {
    logUnexpectedServerError("otm-exception-inbox: query failed", err, {
      organizationId,
    })
    return (
      <GovernedPatternCListSection
        layout="embedded"
        title={t("exceptionInboxTitle")}
        listConfiguration={buildOtmEmbeddedListSurfaceErrorConfiguration({
          columnsId: OTM_LIST_SURFACE_IDS.exceptionInbox,
          emptyTitle: t("exceptionInboxEmpty"),
          firstColumn: { id: "employee", header: t("colEmployee") },
        })}
        surfaceKey="hrm:overtime:exception-inbox:error"
        resolveConfiguredPermission={false}
        loadError={{
          variant: "error",
          title: t("exceptionInboxLoadFailed"),
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
      row.exceptionType,
      row.justification,
      row.workDate
    )
  )

  const listConfiguration = buildOtmExceptionInboxListSurfaceConfiguration(
    filteredRows,
    orgSlug,
    {
      empty: t("exceptionInboxEmpty"),
      colEmployee: t("colEmployee"),
      colWorkDate: t("colWorkDate"),
      colType: t("colExceptionType"),
      colJustification: t("colExceptionJustification"),
      colTimeRange: t("colTimeRange"),
      colDuration: t("colDuration"),
      colActions: t("colActions"),
      exceptionTypeLabel: (type) => exceptionTypeLabels[type],
      formatDuration: formatOvertimeDurationMinutes,
      approveLabel: t("exceptionApprove"),
      rejectLabel: t("exceptionReject"),
    },
    {
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
      title={t("exceptionInboxTitle")}
      description={t("exceptionInboxDescription")}
      surfaceKey={OTM_LIST_SURFACE_IDS.exceptionInbox}
      listConfiguration={listConfiguration}
      invalid={{
        variant: "error",
        title: t("exceptionInboxLoadFailed"),
      }}
      trailingColumn={{
        header: t("colActions"),
        Cell: OtmExceptionDecisionTrailingCell,
      }}
    />
  )
}
