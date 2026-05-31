/** HRM-EXP-028 — audit verbs for expense claim lifecycle. */
export const hrPayrollExpenseAuditActions = {
  claim: {
    created: "hr.expense.claim.create",
    submitted: "hr.expense.claim.submit",
    receiptUploaded: "hr.expense.claim.receipt.upload",
    validated: "hr.expense.claim.validate",
    approved: "hr.expense.claim.approve",
    rejected: "hr.expense.claim.reject",
    returned: "hr.expense.claim.return",
    clarificationRequested: "hr.expense.claim.clarification.request",
    exceptionApproved: "hr.expense.claim.exception.approve",
    paid: "hr.expense.claim.pay",
    cancelled: "hr.expense.claim.cancel",
  },
  report: {
    exported: "hr.expense.report.export",
  },
} as const;
