export const hrTalentRonAuditActions = {
  requisition: {
    created: "hr.ron.requisition.created",
    approvalRequested: "hr.ron.requisition.approval_requested",
    approved: "hr.ron.requisition.approved",
  },
  posting: {
    created: "hr.ron.posting.created",
    published: "hr.ron.posting.published",
  },
  application: {
    submitted: "hr.ron.application.submitted",
    screened: "hr.ron.application.screened",
    stageMoved: "hr.ron.application.stage_moved",
  },
  interview: {
    scheduled: "hr.ron.interview.scheduled",
    scorecardSubmitted: "hr.ron.interview.scorecard_submitted",
  },
  assessment: {
    assigned: "hr.ron.assessment.assigned",
    resultRecorded: "hr.ron.assessment.result_recorded",
  },
  communication: {
    sent: "hr.ron.communication.sent",
  },
  offer: {
    created: "hr.ron.offer.created",
    approvalRequested: "hr.ron.offer.approval_requested",
    approved: "hr.ron.offer.approved",
    sent: "hr.ron.offer.sent",
    accepted: "hr.ron.offer.accepted",
  },
  onboarding: {
    conversionReferenced: "hr.ron.conversion.referenced",
    caseTriggered: "hr.ron.onboarding.case_triggered",
    taskCompleted: "hr.ron.onboarding.task_completed",
    readinessChecked: "hr.ron.onboarding.readiness_checked",
    completionBlocked: "hr.ron.onboarding.completion_blocked",
    completed: "hr.ron.onboarding.completed",
  },
} as const;

type NestedAuditActionValues<T> = T extends string
  ? T
  : T extends Record<string, infer V>
    ? NestedAuditActionValues<V>
    : never;

export type HrTalentRonAuditAction = NestedAuditActionValues<
  typeof hrTalentRonAuditActions
>;
