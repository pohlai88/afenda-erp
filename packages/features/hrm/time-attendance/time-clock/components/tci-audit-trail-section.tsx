import { getTranslations } from "next-intl/server"

import { GovernedPatternBListSection } from "@afenda/governed-surface/server"

import { buildTimeClockAuditTrailListSurfaceConfiguration } from "../data/tci-surface-builders.server"
import {
  toTimeClockListLoadError,
  type TimeClockLoadError,
} from "../data/tci-load-error.shared"
import type { TimeClockAuditTrailRow } from "../data/tci-audit-trail.server"
import { HRM_TCI_AUDIT, type HrmTciAuditAction } from "../tci.contract"
import { TCI_AUDIT_ACTION_PREFIX } from "../tci-audit-trail.shared"

const TCI_AUDIT_ACTION_LABEL_KEYS = {
  [HRM_TCI_AUDIT.deviceCreate]: "deviceCreate",
  [HRM_TCI_AUDIT.deviceUpdate]: "deviceUpdate",
  [HRM_TCI_AUDIT.deviceRevoke]: "deviceRevoke",
  [HRM_TCI_AUDIT.mappingCreate]: "mappingCreate",
  [HRM_TCI_AUDIT.mappingUpdate]: "mappingUpdate",
  [HRM_TCI_AUDIT.punchCreate]: "punchCreate",
  [HRM_TCI_AUDIT.punchSearch]: "punchSearch",
  [HRM_TCI_AUDIT.syncRun]: "syncRun",
  [HRM_TCI_AUDIT.syncFail]: "syncFail",
  [HRM_TCI_AUDIT.exceptionSubmit]: "exceptionSubmit",
  [HRM_TCI_AUDIT.exceptionApprove]: "exceptionApprove",
  [HRM_TCI_AUDIT.exceptionReject]: "exceptionReject",
  [HRM_TCI_AUDIT.reportExport]: "reportExport",
} as const satisfies Record<HrmTciAuditAction, string>

export async function TimeClockAuditTrailSection({
  rows,
  parentAccessAllowed = true,
  loadError,
}: {
  rows: readonly TimeClockAuditTrailRow[]
  parentAccessAllowed?: boolean
  loadError?: TimeClockLoadError
}) {
  const t = await getTranslations("Erp.Hrm.timeClock.auditTrail")
  const tActions = await getTranslations("Erp.Hrm.timeClock.auditActionLabels")

  const listConfiguration = buildTimeClockAuditTrailListSurfaceConfiguration(
    rows,
    {
      empty: t("empty"),
      colWhen: t("colWhen"),
      colAction: t("colAction"),
      colActor: t("colActor"),
      colResource: t("colResource"),
      colMetadata: t("colMetadata"),
      formatAction: (action) => {
        const labelKey =
          TCI_AUDIT_ACTION_LABEL_KEYS[action as HrmTciAuditAction] ?? null
        if (labelKey != null) {
          return tActions(labelKey)
        }
        return action.replace(`${TCI_AUDIT_ACTION_PREFIX}.`, "")
      },
      formatActor: (row) => row.actorEmail ?? row.actorUserId ?? "—",
      formatResource: (row) => {
        if (row.resourceType == null && row.resourceId == null) return "—"
        if (row.resourceType != null && row.resourceId != null) {
          return `${row.resourceType} · ${row.resourceId}`
        }
        return row.resourceType ?? row.resourceId ?? "—"
      },
    }
  )

  return (
    <GovernedPatternBListSection
      title={t("title")}
      description={t("description")}
      surfaceKey="hrm:time-clock:audit-trail"
      listConfiguration={listConfiguration}
      parentAccessAllowed={parentAccessAllowed}
      resolveConfiguredPermission={false}
      loadError={toTimeClockListLoadError(loadError)}
    />
  )
}
