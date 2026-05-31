export const hrPayrollProcessingAuditActions = {
  run: {
    created: "hr.payroll.run.created",
    calculated: "hr.payroll.run.calculated",
    previewed: "hr.payroll.run.previewed",
    submitted_for_approval: "hr.payroll.run.submitted_for_approval",
    approved: "hr.payroll.run.approved",
    locked: "hr.payroll.run.locked",
    finalized: "hr.payroll.run.finalized",
    corrected: "hr.payroll.run.corrected",
    reversed: "hr.payroll.run.reversed",
  },
  payslip: {
    generated: "hr.payroll.payslip.generated",
    ess_viewed: "hr.payroll.payslip.ess_viewed",
  },
  payment: {
    batch_created: "hr.payroll.payment.batch_created",
    status_updated: "hr.payroll.payment.status_updated",
  },
  journal: {
    generated: "hr.payroll.journal.generated",
  },
  group: {
    created: "hr.payroll.group.created",
    employee_assigned: "hr.payroll.group.employee_assigned",
  },
} as const;
