import { getTranslations } from "next-intl/server"

import { GovernedPatternBListSection } from "@afenda/governed-surface/server"

import {
  buildLmsAuditTrailListSurfaceConfiguration,
  type LmsAuditTrailListCopy,
} from "../data/lms-audit-trail-list-surface.server"
import type { LmsAuditTrailRow } from "../data/lms-audit-trail.server"
import { HRM_LMS_AUDIT, type HrmLmsAuditAction } from "../lms.contract"
import {
  LMS_AUDIT_ACTION_PREFIX,
  LMS_AUDIT_TRAIL_SURFACE_KEY,
} from "../lms-audit-trail.shared"

const LMS_AUDIT_ACTION_LABEL_KEYS = {
  [HRM_LMS_AUDIT.courseCreate]: "courseCreate",
  [HRM_LMS_AUDIT.courseUpdate]: "courseUpdate",
  [HRM_LMS_AUDIT.courseDeprecate]: "courseDeprecate",
  [HRM_LMS_AUDIT.contentRefCreate]: "contentRefCreate",
  [HRM_LMS_AUDIT.learningPathCreate]: "learningPathCreate",
  [HRM_LMS_AUDIT.learningPathUpdate]: "learningPathUpdate",
  [HRM_LMS_AUDIT.learningPathDeprecate]: "learningPathDeprecate",
  [HRM_LMS_AUDIT.pathCourseCreate]: "pathCourseCreate",
  [HRM_LMS_AUDIT.assignmentCreate]: "assignmentCreate",
  [HRM_LMS_AUDIT.enrollmentCreate]: "enrollmentCreate",
  [HRM_LMS_AUDIT.enrollmentApprove]: "enrollmentApprove",
  [HRM_LMS_AUDIT.enrollmentReject]: "enrollmentReject",
  [HRM_LMS_AUDIT.progressUpdate]: "progressUpdate",
  [HRM_LMS_AUDIT.assessmentAttemptCreate]: "assessmentAttemptCreate",
  [HRM_LMS_AUDIT.certificateIssue]: "certificateIssue",
  [HRM_LMS_AUDIT.certificateRenew]: "certificateRenew",
  [HRM_LMS_AUDIT.lessonCreate]: "lessonCreate",
  [HRM_LMS_AUDIT.assessmentCreate]: "assessmentCreate",
  [HRM_LMS_AUDIT.reminderDispatch]: "reminderDispatch",
  [HRM_LMS_AUDIT.reportExport]: "reportExport",
} as const satisfies Record<HrmLmsAuditAction, string>

export async function LmsAuditTrailSection({
  rows,
  parentAccessAllowed = true,
}: {
  rows: readonly LmsAuditTrailRow[]
  parentAccessAllowed?: boolean
}) {
  const t = await getTranslations("Erp.Hrm.lms.auditTrail")
  const tActions = await getTranslations("Erp.Hrm.lms.auditActionLabels")

  const labels: LmsAuditTrailListCopy = {
    empty: t("empty"),
    colWhen: t("colWhen"),
    colAction: t("colAction"),
    colActor: t("colActor"),
    colResource: t("colResource"),
    colMetadata: t("colMetadata"),
    formatAction: (action) => {
      const labelKey =
        LMS_AUDIT_ACTION_LABEL_KEYS[action as HrmLmsAuditAction] ?? null
      if (labelKey != null) {
        return tActions(labelKey)
      }
      return action.replace(`${LMS_AUDIT_ACTION_PREFIX}_`, "")
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

  const listConfiguration = buildLmsAuditTrailListSurfaceConfiguration(
    rows,
    labels
  )

  return (
    <GovernedPatternBListSection
      title={t("title")}
      description={t("description")}
      surfaceKey={LMS_AUDIT_TRAIL_SURFACE_KEY}
      listConfiguration={listConfiguration}
      parentAccessAllowed={parentAccessAllowed}
      resolveConfiguredPermission={false}
    />
  )
}
