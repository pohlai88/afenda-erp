/** HRM-BON-030 audit verbs for bonus & incentive management. */
export const hrPayrollBonusAuditActions = {
  plan: {
    created: "hr.bonus.plan.create",
    updated: "hr.bonus.plan.update",
    archived: "hr.bonus.plan.archive",
    upserted: "hr.bonus.plan.upsert",
  },
  eligibility: {
    ruleConfigured: "hr.bonus.eligibility.rule.configure",
    assigned: "hr.bonus.eligibility.assign",
    validated: "hr.bonus.eligibility.validate",
    upserted: "hr.bonus.eligibility.upsert",
  },
  participant: {
    assigned: "hr.bonus.participant.assign",
  },
  cycle: {
    configured: "hr.bonus.cycle.configure",
    upserted: "hr.bonus.cycle.upsert",
  },
  target: {
    recorded: "hr.bonus.target.record",
    upserted: "hr.bonus.target.upsert",
    achievementRecorded: "hr.bonus.achievement.record",
    calculated: "hr.bonus.achievement.calculate",
  },
  formula: {
    configured: "hr.bonus.formula.configure",
  },
  commission: {
    tiersConfigured: "hr.bonus.commission.tiers.configure",
  },
  accelerator: {
    configured: "hr.bonus.accelerator.configure",
  },
  achievement: {
    recorded: "hr.bonus.achievement.record",
    updated: "hr.bonus.achievement.update",
  },
  payout: {
    calculated: "hr.bonus.payout.calculate",
    adjusted: "hr.bonus.payout.adjust",
    submitted: "hr.bonus.payout.submit",
    approved: "hr.bonus.payout.approve",
    rejected: "hr.bonus.payout.reject",
    returned: "hr.bonus.payout.return",
    locked: "hr.bonus.payout.lock",
  },
  payroll: {
    integrated: "hr.bonus.payroll.integrate",
  },
  accounting: {
    allocated: "hr.bonus.accounting.allocate",
  },
  correction: {
    recorded: "hr.bonus.correction.record",
    clawback: "hr.bonus.clawback.record",
  },
  report: {
    exported: "hr.bonus.report.export",
  },
} as const;

type BonusAuditActionGroup = (typeof hrPayrollBonusAuditActions)[keyof typeof hrPayrollBonusAuditActions];

export type HrPayrollBonusAuditAction = {
  [K in keyof BonusAuditActionGroup]: BonusAuditActionGroup[K][keyof BonusAuditActionGroup[K]];
}[keyof BonusAuditActionGroup];
