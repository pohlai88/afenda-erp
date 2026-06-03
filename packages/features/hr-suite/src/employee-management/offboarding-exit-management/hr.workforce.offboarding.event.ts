export const hrWorkforceOffboardingAuditActions = {
  case: {
    started: "hr.offboarding.case.start",
    completed: "hr.offboarding.case.complete",
    cancelled: "hr.offboarding.case.cancel",
  },
  clearance: {
    completed: "hr.offboarding.clearance.complete",
    waived: "hr.offboarding.clearance.waive",
  },
  approval: {
    approved: "hr.offboarding.approval.approved",
    rejected: "hr.offboarding.approval.rejected",
  },
  asset: {
    updated: "hr.offboarding.asset.update",
  },
  exitInterview: {
    scheduled: "hr.offboarding.exit_interview.schedule",
    feedbackRecorded: "hr.offboarding.exit_interview.feedback",
  },
  settlement: {
    ready: "hr.offboarding.settlement.ready",
    blockerAdded: "hr.offboarding.settlement.blocker.add",
    blockerResolved: "hr.offboarding.settlement.blocker.resolve",
  },
  rehire: {
    recorded: "hr.offboarding.rehire.record",
  },
  vacancy: {
    triggered: "hr.offboarding.vacancy.trigger",
  },
  document: {
    linked: "hr.offboarding.document.link",
  },
} as const;

export type HrWorkforceOffboardingAuditAction =
  | (typeof hrWorkforceOffboardingAuditActions)["case"][keyof (typeof hrWorkforceOffboardingAuditActions)["case"]]
  | (typeof hrWorkforceOffboardingAuditActions)["clearance"][keyof (typeof hrWorkforceOffboardingAuditActions)["clearance"]]
  | (typeof hrWorkforceOffboardingAuditActions)["approval"][keyof (typeof hrWorkforceOffboardingAuditActions)["approval"]]
  | (typeof hrWorkforceOffboardingAuditActions)["asset"][keyof (typeof hrWorkforceOffboardingAuditActions)["asset"]]
  | (typeof hrWorkforceOffboardingAuditActions)["exitInterview"][keyof (typeof hrWorkforceOffboardingAuditActions)["exitInterview"]]
  | (typeof hrWorkforceOffboardingAuditActions)["settlement"][keyof (typeof hrWorkforceOffboardingAuditActions)["settlement"]]
  | (typeof hrWorkforceOffboardingAuditActions)["rehire"][keyof (typeof hrWorkforceOffboardingAuditActions)["rehire"]]
  | (typeof hrWorkforceOffboardingAuditActions)["vacancy"][keyof (typeof hrWorkforceOffboardingAuditActions)["vacancy"]]
  | (typeof hrWorkforceOffboardingAuditActions)["document"][keyof (typeof hrWorkforceOffboardingAuditActions)["document"]];
