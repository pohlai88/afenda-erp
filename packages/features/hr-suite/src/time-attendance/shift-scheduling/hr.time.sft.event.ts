/** Audit action strings for SFT mutations (HRM-SFT-030). */
export const hrTimeSftAuditActions = {
  template: {
    created: "hr.sft.template.created",
    updated: "hr.sft.template.updated",
    archived: "hr.sft.template.archived",
  },
  assignment: {
    created: "hr.sft.assignment.created",
    bulkCreated: "hr.sft.assignment.bulk_created",
    published: "hr.sft.assignment.published",
    cancelled: "hr.sft.assignment.cancelled",
  },
  recurrence: {
    created: "hr.sft.recurrence.created",
    applied: "hr.sft.recurrence.applied",
  },
  rotation: {
    created: "hr.sft.rotation.created",
    stepAdded: "hr.sft.rotation.step_added",
    applied: "hr.sft.rotation.applied",
  },
  roster: {
    published: "hr.sft.roster.published",
  },
  swap: {
    submitted: "hr.sft.swap.submitted",
    approved: "hr.sft.swap.approved",
    rejected: "hr.sft.swap.rejected",
    returned: "hr.sft.swap.returned",
    overridden: "hr.sft.swap.overridden",
  },
  scheduleChange: {
    submitted: "hr.sft.schedule_change.submitted",
    approved: "hr.sft.schedule_change.approved",
    rejected: "hr.sft.schedule_change.rejected",
    returned: "hr.sft.schedule_change.returned",
    overridden: "hr.sft.schedule_change.overridden",
  },
  payroll: {
    referenceLinked: "hr.sft.payroll.reference_linked",
  },
  report: {
    definitionSaved: "hr.sft.report.definition_saved",
    generated: "hr.sft.report.generated",
    exported: "hr.sft.report.exported",
  },
  notification: {
    enqueued: "hr.sft.notification.enqueued",
  },
  policy: {
    updated: "hr.sft.policy.updated",
  },
} as const;

function collectAuditActionValues(
  group: Record<string, string>,
): readonly string[] {
  return Object.values(group);
}

/** Canonical manifest of SFT audit emitters (HRM-SFT-030). */
export const HR_SFT_EMITTED_AUDIT_ACTIONS = [
  ...collectAuditActionValues(hrTimeSftAuditActions.template),
  ...collectAuditActionValues(hrTimeSftAuditActions.assignment),
  ...collectAuditActionValues(hrTimeSftAuditActions.recurrence),
  ...collectAuditActionValues(hrTimeSftAuditActions.rotation),
  ...collectAuditActionValues(hrTimeSftAuditActions.roster),
  ...collectAuditActionValues(hrTimeSftAuditActions.swap),
  ...collectAuditActionValues(hrTimeSftAuditActions.scheduleChange),
  ...collectAuditActionValues(hrTimeSftAuditActions.payroll),
  ...collectAuditActionValues(hrTimeSftAuditActions.report),
  ...collectAuditActionValues(hrTimeSftAuditActions.notification),
  ...collectAuditActionValues(hrTimeSftAuditActions.policy),
] as const;

export type HrSftEmittedAuditAction =
  (typeof HR_SFT_EMITTED_AUDIT_ACTIONS)[number];

export type HrTimeSftAuditAction = HrSftEmittedAuditAction;

export function isHrSftAuditAction(
  action: string,
): action is HrSftEmittedAuditAction {
  return (HR_SFT_EMITTED_AUDIT_ACTIONS as readonly string[]).includes(action);
}

/** Map execution audit strings to durable store enum values. */
export const hrTimeSftAuditActionToStoreAction = {
  [hrTimeSftAuditActions.template.created]: "template_created",
  [hrTimeSftAuditActions.template.updated]: "template_updated",
  [hrTimeSftAuditActions.template.archived]: "template_archived",
  [hrTimeSftAuditActions.assignment.created]: "assignment_created",
  [hrTimeSftAuditActions.assignment.bulkCreated]: "assignment_bulk_created",
  [hrTimeSftAuditActions.assignment.published]: "assignment_published",
  [hrTimeSftAuditActions.assignment.cancelled]: "assignment_cancelled",
  [hrTimeSftAuditActions.recurrence.created]: "recurrence_created",
  [hrTimeSftAuditActions.recurrence.applied]: "recurrence_applied",
  [hrTimeSftAuditActions.rotation.created]: "rotation_created",
  [hrTimeSftAuditActions.rotation.stepAdded]: "rotation_step_added",
  [hrTimeSftAuditActions.rotation.applied]: "rotation_applied",
  [hrTimeSftAuditActions.roster.published]: "roster_published",
  [hrTimeSftAuditActions.swap.submitted]: "swap_submitted",
  [hrTimeSftAuditActions.swap.approved]: "swap_approved",
  [hrTimeSftAuditActions.swap.rejected]: "swap_rejected",
  [hrTimeSftAuditActions.swap.returned]: "swap_returned",
  [hrTimeSftAuditActions.swap.overridden]: "swap_overridden",
  [hrTimeSftAuditActions.scheduleChange.submitted]: "schedule_change_submitted",
  [hrTimeSftAuditActions.scheduleChange.approved]: "schedule_change_approved",
  [hrTimeSftAuditActions.scheduleChange.rejected]: "schedule_change_rejected",
  [hrTimeSftAuditActions.scheduleChange.returned]: "schedule_change_returned",
  [hrTimeSftAuditActions.scheduleChange.overridden]: "schedule_change_overridden",
  [hrTimeSftAuditActions.payroll.referenceLinked]: "payroll_reference_linked",
  [hrTimeSftAuditActions.report.definitionSaved]: "report_definition_saved",
  [hrTimeSftAuditActions.report.generated]: "report_exported",
  [hrTimeSftAuditActions.report.exported]: "report_exported",
  [hrTimeSftAuditActions.notification.enqueued]: "notification_enqueued",
  [hrTimeSftAuditActions.policy.updated]: "policy_updated",
} as const;

export type HrTimeSftAuditStoreAction =
  (typeof hrTimeSftAuditActionToStoreAction)[keyof typeof hrTimeSftAuditActionToStoreAction];

export function resolveHrTimeSftAuditStoreAction(
  action: HrTimeSftAuditAction,
): HrTimeSftAuditStoreAction {
  return hrTimeSftAuditActionToStoreAction[
    action as keyof typeof hrTimeSftAuditActionToStoreAction
  ];
}
