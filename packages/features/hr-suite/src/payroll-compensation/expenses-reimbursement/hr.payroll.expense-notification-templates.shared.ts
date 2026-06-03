import type { HrExpenseNotificationKind } from "./hr.payroll.expense-constants.shared";

export const hrExpenseNotificationSubjectTypes = {
  claim: "hr_expense_claim",
} as const;

export function buildHrExpenseNotificationCopy(input: {
  kind: HrExpenseNotificationKind;
  claimNumber?: string;
  detail?: string;
}): { title: string; body: string } {
  const claimLabel = input.claimNumber ? ` ${input.claimNumber}` : "";

  switch (input.kind) {
    case "submitted":
      return {
        title: "Expense claim submitted",
        body: `Your expense claim${claimLabel} was submitted for review.`,
      };
    case "approved":
      return {
        title: "Expense claim approved",
        body: `Expense claim${claimLabel} was approved.`,
      };
    case "rejected":
      return {
        title: "Expense claim rejected",
        body: `Expense claim${claimLabel} was rejected.${input.detail ? ` ${input.detail}` : ""}`,
      };
    case "returned":
      return {
        title: "Expense claim returned",
        body: `Expense claim${claimLabel} was returned for correction.`,
      };
    case "overdue":
      return {
        title: "Expense claim overdue",
        body: `Expense claim${claimLabel} is overdue for approval.`,
      };
    case "paid":
      return {
        title: "Expense reimbursement paid",
        body: `Reimbursement for claim${claimLabel} was paid.`,
      };
    default: {
      const exhaustive: never = input.kind;
      return exhaustive;
    }
  }
}
