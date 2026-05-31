import { actionFailure } from "@afenda/governed-surface/schemas";
import { HrExpenseCommandError } from "@afenda/db";

import {
  HrExpenseAuditAccessError,
  HrExpenseFinanceAccessError,
  HrExpenseSensitiveAccessError,
} from "./hr.payroll.expense-org-scope.shared";

export function toExpenseActionFailure(error: unknown) {
  if (error instanceof HrExpenseSensitiveAccessError) {
    return actionFailure("forbidden", "Sensitive expense data is restricted.");
  }
  if (error instanceof HrExpenseFinanceAccessError) {
    return actionFailure("forbidden", "Finance expense access is required.");
  }
  if (error instanceof HrExpenseAuditAccessError) {
    return actionFailure("forbidden", "Expense audit access is required.");
  }
  if (error instanceof HrExpenseCommandError) {
    switch (error.code) {
      case "claim_not_found":
        return actionFailure("not_found", "Expense claim was not found.");
      case "claim_not_approved":
        return actionFailure(
          "validation",
          "Only approved claims can be sent for payment.",
        );
      case "claim_already_paid":
        return actionFailure("validation", "Claim has already been paid.");
      case "payment_reference_not_found":
        return actionFailure(
          "validation",
          "Payment must be staged before recording a reference.",
        );
      case "employee_not_found":
        return actionFailure("not_found", "Employee was not found.");
      case "invalid_claim_status":
        return actionFailure(
          "validation",
          "Receipts can only be attached to draft or returned claims.",
        );
      case "receipt_already_attached":
        return actionFailure(
          "validation",
          "This receipt has already been attached to the claim.",
        );
      case "policy_not_found":
        return actionFailure(
          "validation",
          "No active expense policy is configured for this claim.",
        );
      default:
        return actionFailure("validation", "Expense claim command failed.");
    }
  }

  return actionFailure("internal", "Expense reimbursement action failed.");
}
