/** Audit action strings for benefits mutations (HRM-BEN-028 foundation). */
export const hrPayrollBenefitsAuditActions = {
  eligibility: {
    ruleConfigured: "hr.benefits.eligibility.rule.configure",
    determined: "hr.benefits.eligibility.determine",
    overrideApproved: "hr.benefits.eligibility.override.approve",
  },
  plan: {
    created: "hr.benefits.plan.create",
    updated: "hr.benefits.plan.update",
    archived: "hr.benefits.plan.archive",
  },
  provider: {
    created: "hr.benefits.provider.create",
    updated: "hr.benefits.provider.update",
    archived: "hr.benefits.provider.archive",
  },
  openEnrollment: {
    windowConfigured: "hr.benefits.open_enrollment.configure",
    windowActivated: "hr.benefits.open_enrollment.activate",
    windowClosed: "hr.benefits.open_enrollment.close",
  },
  enrollment: {
    created: "hr.benefits.enrollment.create",
    approved: "hr.benefits.enrollment.approve",
    waived: "hr.benefits.enrollment.waive",
    changed: "hr.benefits.enrollment.change",
    terminated: "hr.benefits.enrollment.terminate",
  },
  dependent: {
    added: "hr.benefits.dependent.add",
    updated: "hr.benefits.dependent.update",
    removed: "hr.benefits.dependent.remove",
    eligibilityVerified: "hr.benefits.dependent.eligibility.verify",
  },
  contribution: {
    stored: "hr.benefits.contribution.store",
    updated: "hr.benefits.contribution.update",
  },
  deduction: {
    referenceCreated: "hr.benefits.deduction.reference.create",
    referenceUpdated: "hr.benefits.deduction.reference.update",
    payrollIntegrated: "hr.benefits.deduction.payroll.integrate",
  },
  lifeEvent: {
    recorded: "hr.benefits.life_event.record",
    processed: "hr.benefits.life_event.process",
  },
  document: {
    linked: "hr.benefits.document.link",
    unlinked: "hr.benefits.document.unlink",
  },
  coverage: {
    statusUpdated: "hr.benefits.coverage.status.update",
    adjustedForEmploymentChange:
      "hr.benefits.coverage.employment_status.adjust",
  },
  reports: {
    exported: "hr.benefits.report.export",
  },
} as const;

export type HrPayrollBenefitsAuditAction =
  | (typeof hrPayrollBenefitsAuditActions)["eligibility"][keyof (typeof hrPayrollBenefitsAuditActions)["eligibility"]]
  | (typeof hrPayrollBenefitsAuditActions)["plan"][keyof (typeof hrPayrollBenefitsAuditActions)["plan"]]
  | (typeof hrPayrollBenefitsAuditActions)["provider"][keyof (typeof hrPayrollBenefitsAuditActions)["provider"]]
  | (typeof hrPayrollBenefitsAuditActions)["openEnrollment"][keyof (typeof hrPayrollBenefitsAuditActions)["openEnrollment"]]
  | (typeof hrPayrollBenefitsAuditActions)["enrollment"][keyof (typeof hrPayrollBenefitsAuditActions)["enrollment"]]
  | (typeof hrPayrollBenefitsAuditActions)["dependent"][keyof (typeof hrPayrollBenefitsAuditActions)["dependent"]]
  | (typeof hrPayrollBenefitsAuditActions)["contribution"][keyof (typeof hrPayrollBenefitsAuditActions)["contribution"]]
  | (typeof hrPayrollBenefitsAuditActions)["deduction"][keyof (typeof hrPayrollBenefitsAuditActions)["deduction"]]
  | (typeof hrPayrollBenefitsAuditActions)["lifeEvent"][keyof (typeof hrPayrollBenefitsAuditActions)["lifeEvent"]]
  | (typeof hrPayrollBenefitsAuditActions)["document"][keyof (typeof hrPayrollBenefitsAuditActions)["document"]]
  | (typeof hrPayrollBenefitsAuditActions)["coverage"][keyof (typeof hrPayrollBenefitsAuditActions)["coverage"]]
  | (typeof hrPayrollBenefitsAuditActions)["reports"][keyof (typeof hrPayrollBenefitsAuditActions)["reports"]];
