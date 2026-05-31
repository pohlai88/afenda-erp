/** Audit action strings for bonus & incentive mutations. */
export const hrPayrollBonusAuditActions = {
  plan: {
    upserted: "hr.bonus.plan.upsert",
    archived: "hr.bonus.plan.archive",
  },
  eligibility: {
    upserted: "hr.bonus.eligibility.upsert",
  },
  participant: {
    assigned: "hr.bonus.participant.assign",
  },
  cycle: {
    upserted: "hr.bonus.cycle.upsert",
  },
  target: {
    upserted: "hr.bonus.target.upsert",
  },
  achievement: {
    recorded: "hr.bonus.achievement.record",
    updated: "hr.bonus.achievement.update",
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
  payout: {
    calculated: "hr.bonus.payout.calculate",
  },
} as const;

export type HrPayrollBonusAuditAction = {
  [Group in keyof typeof hrPayrollBonusAuditActions]: (typeof hrPayrollBonusAuditActions)[Group][keyof (typeof hrPayrollBonusAuditActions)[Group]];
}[keyof typeof hrPayrollBonusAuditActions];
