export const hrTimeLeaveAuditActions = {
  application: {
    submitted: "hr.time.leave.application.submitted",
    amended: "hr.time.leave.application.amended",
    cancelled: "hr.time.leave.application.cancelled",
  },
  approval: {
    approved: "hr.time.leave.approval.approved",
    rejected: "hr.time.leave.approval.rejected",
    returned: "hr.time.leave.approval.returned",
    clarificationRequested: "hr.time.leave.approval.clarification_requested",
  },
  balance: {
    adjusted: "hr.time.leave.balance.adjusted",
    carryForwardProcessed: "hr.time.leave.balance.carry_forward_processed",
  },
  payroll: {
    unpaidExported: "hr.time.leave.payroll.unpaid_exported",
  },
} as const;

export type HrTimeLeaveAuditAction =
  | (typeof hrTimeLeaveAuditActions.application)[keyof typeof hrTimeLeaveAuditActions.application]
  | (typeof hrTimeLeaveAuditActions.approval)[keyof typeof hrTimeLeaveAuditActions.approval]
  | (typeof hrTimeLeaveAuditActions.balance)[keyof typeof hrTimeLeaveAuditActions.balance]
  | (typeof hrTimeLeaveAuditActions.payroll)[keyof typeof hrTimeLeaveAuditActions.payroll];
