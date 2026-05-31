export class HrExpenseCommandError extends Error {
  constructor(
    readonly code:
      | "claim_not_found"
      | "claim_not_approved"
      | "claim_already_paid"
      | "payment_reference_not_found"
      | "invalid_payment_channel"
      | "payment_reference_exists"
      | "employee_not_found"
      | "policy_not_found"
      | "invalid_claim_status"
      | "receipt_already_attached",
  ) {
    super(code);
    this.name = "HrExpenseCommandError";
  }
}

export const HR_EXPENSE_REPORT_EXPORT_ROW_CAP = 500;
