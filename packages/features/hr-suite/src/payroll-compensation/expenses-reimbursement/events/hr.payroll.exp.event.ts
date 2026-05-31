/** HRM-EXP-028 — expense reimbursement audit action strings. */
export const hrPayrollExpenseAuditActions = {
  claim: {
    submit: "erp.hrm.expense.claim.submit",
    approve: "erp.hrm.expense.claim.approve",
    reject: "erp.hrm.expense.claim.reject",
    return: "erp.hrm.expense.claim.return",
    clarificationRequest: "erp.hrm.expense.claim.clarification_request",
  },
  exception: {
    approve: "erp.hrm.expense.exception.approve",
    reject: "erp.hrm.expense.exception.reject",
  },
} as const;

export const HRM_EXP_AUDIT = hrPayrollExpenseAuditActions;
