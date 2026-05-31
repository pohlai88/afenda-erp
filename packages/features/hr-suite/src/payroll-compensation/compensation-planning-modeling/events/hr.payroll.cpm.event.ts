export const hrPayrollCpmAuditActions = {
  cycle: {
    create: "hr.cpm.cycle.create",
    update: "hr.cpm.cycle.update",
  },
  budgetPool: {
    create: "hr.cpm.budget_pool.create",
  },
  eligibility: {
    create: "hr.cpm.eligibility_rule.create",
  },
  participant: {
    assign: "hr.cpm.participant.assign",
    bulkAssign: "hr.cpm.participant.bulk_assign",
  },
  recommendation: {
    create: "hr.cpm.recommendation.create",
    submit: "hr.cpm.recommendation.submit",
    approve: "hr.cpm.recommendation.approve",
    reject: "hr.cpm.recommendation.reject",
    return: "hr.cpm.recommendation.return",
    adjust: "hr.cpm.recommendation.adjust",
  },
  scenario: {
    create: "hr.cpm.scenario.create",
  },
  approval: {
    route: "hr.cpm.approval.route",
  },
  payroll: {
    integrate: "hr.cpm.payroll.integrate",
    synced: "hr.cpm.payroll.synced",
  },
  report: {
    export: "hr.cpm.report.export",
  },
} as const;
