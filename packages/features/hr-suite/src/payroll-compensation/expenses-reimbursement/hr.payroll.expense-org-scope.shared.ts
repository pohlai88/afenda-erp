export class HrExpenseSensitiveAccessError extends Error {
  constructor() {
    super("hr_expense_sensitive_access_denied");
    this.name = "HrExpenseSensitiveAccessError";
  }
}

export class HrExpenseFinanceAccessError extends Error {
  constructor() {
    super("hr_expense_finance_access_denied");
    this.name = "HrExpenseFinanceAccessError";
  }
}

export class HrExpenseAuditAccessError extends Error {
  constructor() {
    super("hr_expense_audit_access_denied");
    this.name = "HrExpenseAuditAccessError";
  }
}
