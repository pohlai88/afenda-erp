import { HrExpenseCommandError } from "@afenda/db";
import {
  actionFailure,
  type ActionResult,
  zodActionFailure,
} from "@afenda/governed-surface/schemas";
import { z } from "zod";

import {
  HrExpenseAuditAccessError,
  HrExpenseFinanceAccessError,
  HrExpenseSensitiveAccessError,
} from "./hr.payroll.expense-org-scope.shared";

export function toExpenseActionFailure<T = void>(error: unknown): ActionResult<T> {
  if (error instanceof z.ZodError) {
    return zodActionFailure<T>(error);
  }

  if (error instanceof HrExpenseSensitiveAccessError) {
    return actionFailure<T>(
      "Sensitive expense data is restricted.",
      undefined,
      "forbidden",
    );
  }
  if (error instanceof HrExpenseFinanceAccessError) {
    return actionFailure<T>(
      "Finance expense access is required.",
      undefined,
      "forbidden",
    );
  }
  if (error instanceof HrExpenseAuditAccessError) {
    return actionFailure<T>(
      "Expense audit access is required.",
      undefined,
      "forbidden",
    );
  }
  if (error instanceof HrExpenseCommandError) {
    switch (error.code) {
      case "claim_not_found":
        return actionFailure<T>(
          "Expense claim was not found.",
          undefined,
          "not_found",
        );
      case "claim_not_approved":
        return actionFailure<T>(
          "Only approved claims can be sent for payment.",
          undefined,
          "validation",
        );
      case "claim_already_paid":
        return actionFailure<T>(
          "Claim has already been paid.",
          undefined,
          "validation",
        );
      case "payment_reference_not_found":
        return actionFailure<T>(
          "Payment must be staged before recording a reference.",
          undefined,
          "validation",
        );
      case "employee_not_found":
        return actionFailure<T>("Employee was not found.", undefined, "not_found");
      case "invalid_claim_status":
        return actionFailure<T>(
          "Receipts can only be attached to draft or returned claims.",
          undefined,
          "validation",
        );
      case "receipt_already_attached":
        return actionFailure<T>(
          "This receipt has already been attached to the claim.",
          undefined,
          "validation",
        );
      case "policy_not_found":
        return actionFailure<T>(
          "No active expense policy is configured for this claim.",
          undefined,
          "validation",
        );
      default:
        return actionFailure<T>(
          "Expense claim command failed.",
          undefined,
          "validation",
        );
    }
  }

  return actionFailure<T>(
    "Expense reimbursement action failed.",
    undefined,
    "internal",
  );
}
