/** Audit action strings for lifecycle mutations (HRM-LCY-028 foundation). */
export const hrWorkforceLifecycleAuditActions = {
  employmentStatus: {
    changed: "hr.lifecycle.employment_status.change",
    scheduled: "hr.lifecycle.employment_status.schedule",
  },
  probation: {
    outcomeRecorded: "hr.lifecycle.probation.outcome",
    extended: "hr.lifecycle.probation.extend",
  },
  confirmation: {
    applied: "hr.lifecycle.confirmation.apply",
  },
  movement: {
    recorded: "hr.lifecycle.movement.record",
  },
  transition: {
    cancelled: "hr.lifecycle.transition.cancel",
    applied: "hr.lifecycle.transition.apply",
  },
  onboarding: {
    caseStarted: "hr.lifecycle.onboarding.case_start",
  },
  offboarding: {
    caseStarted: "hr.lifecycle.offboarding.case_start",
  },
  exit: {
    noticePeriodStarted: "hr.lifecycle.exit.notice_period",
  },
} as const;

export type HrWorkforceLifecycleAuditAction =
  | (typeof hrWorkforceLifecycleAuditActions)["employmentStatus"][keyof (typeof hrWorkforceLifecycleAuditActions)["employmentStatus"]]
  | (typeof hrWorkforceLifecycleAuditActions)["probation"][keyof (typeof hrWorkforceLifecycleAuditActions)["probation"]]
  | (typeof hrWorkforceLifecycleAuditActions)["confirmation"][keyof (typeof hrWorkforceLifecycleAuditActions)["confirmation"]]
  | (typeof hrWorkforceLifecycleAuditActions)["movement"][keyof (typeof hrWorkforceLifecycleAuditActions)["movement"]]
  | (typeof hrWorkforceLifecycleAuditActions)["transition"][keyof (typeof hrWorkforceLifecycleAuditActions)["transition"]]
  | (typeof hrWorkforceLifecycleAuditActions)["onboarding"][keyof (typeof hrWorkforceLifecycleAuditActions)["onboarding"]]
  | (typeof hrWorkforceLifecycleAuditActions)["offboarding"][keyof (typeof hrWorkforceLifecycleAuditActions)["offboarding"]]
  | (typeof hrWorkforceLifecycleAuditActions)["exit"][keyof (typeof hrWorkforceLifecycleAuditActions)["exit"]];
