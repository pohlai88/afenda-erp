import { getTranslations } from "next-intl/server"

import { logUnexpectedServerError } from "@afenda/platform/logger.server"
import { requireOrgSession } from "@afenda/platform/auth"

import {
  buildAttendanceCorrectionPendingListSurfaceConfiguration,
  type AttendanceCorrectionPendingRow,
} from "../data/attendance-list-surface.server"
import { listPendingAttendanceCorrectionsForOrg } from "../data/attendance-correction-pending.queries.server"
import { ATTENDANCE_LIST_SURFACE_IDS } from "../data/attendance-surface-metadata.shared"
import { buildEmbeddedListSurfaceErrorConfiguration } from "../data/lam-embedded-list-surface-error.server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

export async function AttendanceCorrectionPending() {
  const [session, t] = await Promise.all([
    requireOrgSession(),
    getTranslations("Erp.Hrm.attendance"),
  ])

  let rows: AttendanceCorrectionPendingRow[]
  try {
    rows = await listPendingAttendanceCorrectionsForOrg(session.organizationId)
  } catch (err) {
    logUnexpectedServerError(
      "attendance-correction-pending: query failed",
      err,
      { organizationId: session.organizationId }
    )
    return (
      <GovernedPatternCListSection
        layout="embedded"
        title=""
        listConfiguration={buildEmbeddedListSurfaceErrorConfiguration({
          columnsId: ATTENDANCE_LIST_SURFACE_IDS.correctionPending,
          emptyTitle: t("correctionPendingEmpty"),
          firstColumn: { id: "event", header: t("correctionPendingColEvent") },
        })}
        surfaceKey="hrm:attendance:correction-pending:error"
        resolveConfiguredPermission={false}
        loadError={{
          variant: "error",
          title: t("correctionPendingLoadFailed"),
        }}
      />
    )
  }

  const listConfiguration =
    buildAttendanceCorrectionPendingListSurfaceConfiguration(rows, {
      empty: t("correctionPendingEmpty"),
      colEvent: t("correctionPendingColEvent"),
      colRequested: t("correctionPendingColRequested"),
      approveLabel: t("correctionPendingApprove"),
    })

  return (
    <GovernedPatternCListSection
      layout="embedded"
      title=""
      listConfiguration={listConfiguration}
      surfaceKey="hrm:attendance:correction-pending"
      parentAccessAllowed
      invalid={{
        variant: "error",
        title: t("correctionPendingLoadFailed"),
      }}
      trailingColumn={{
        header: t("colActions"),
        cellId: "governed.metadata",
      }}
    />
  )
}
