/** Audit action strings for AAT mutations (HRM-AAT-029). */
export const hrTimeAatAuditActions = {
  analytics: {
    generated: "hr.aat.analytics.generated",
    snapshotPersisted: "hr.aat.analytics.snapshot.persisted",
  },
  threshold: {
    updated: "hr.aat.threshold.updated",
  },
  report: {
    generated: "hr.aat.report.generated",
    exported: "hr.aat.report.exported",
  },
  risk: {
    reviewed: "hr.aat.risk.reviewed",
  },
  correctiveAction: {
    linked: "hr.aat.corrective_action.linked",
  },
  notification: {
    enqueued: "hr.aat.notification.enqueued",
  },
} as const;

/** @deprecated Use hrTimeAatAuditActions.report */
export const hrAatReportAuditActions = hrTimeAatAuditActions.report;

function collectAuditActionValues(
  group: Record<string, string>,
): readonly string[] {
  return Object.values(group);
}

/** Canonical manifest of AAT audit emitters (HRM-AAT-029). */
export const HR_AAT_EMITTED_AUDIT_ACTIONS = [
  ...collectAuditActionValues(hrTimeAatAuditActions.analytics),
  ...collectAuditActionValues(hrTimeAatAuditActions.threshold),
  ...collectAuditActionValues(hrTimeAatAuditActions.report),
  ...collectAuditActionValues(hrTimeAatAuditActions.risk),
  ...collectAuditActionValues(hrTimeAatAuditActions.correctiveAction),
  ...collectAuditActionValues(hrTimeAatAuditActions.notification),
] as const;

export type HrAatEmittedAuditAction =
  (typeof HR_AAT_EMITTED_AUDIT_ACTIONS)[number];

export type HrTimeAatAuditAction = HrAatEmittedAuditAction;

export function isHrAatAuditAction(
  action: string,
): action is HrAatEmittedAuditAction {
  return (HR_AAT_EMITTED_AUDIT_ACTIONS as readonly string[]).includes(action);
}
