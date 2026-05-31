export const hrExpenseClaimsColumnsId = "hr.payroll.expense.claims";
export const hrExpenseReportsColumnsId = "hr.payroll.expense.reports";
export const hrExpenseAuditTrailColumnsId = "hr.payroll.expense.audit-trail";

export const HR_EXPENSE_LIST_SURFACE_COLUMNS_BY_KEY = {
  "expense-claims": hrExpenseClaimsColumnsId,
  "expense-reports": hrExpenseReportsColumnsId,
  "expense-audit-trail": hrExpenseAuditTrailColumnsId,
} as const;
