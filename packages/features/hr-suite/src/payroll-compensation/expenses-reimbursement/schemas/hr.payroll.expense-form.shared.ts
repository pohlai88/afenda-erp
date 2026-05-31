import {
  HR_EXPENSE_CLAIM_CATEGORIES,
  HR_EXPENSE_CLAIM_STATUSES,
  HR_EXPENSE_RECEIPT_MANDATORY_CATEGORIES,
  type HrExpenseClaimCategory,
} from "./hr.payroll.expense-constants.shared";

export function formatExpenseEnumLabel(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function expenseCategoryRequiresReceipt(category: HrExpenseClaimCategory): boolean {
  return (HR_EXPENSE_RECEIPT_MANDATORY_CATEGORIES as readonly string[]).includes(
    category,
  );
}

export const hrExpenseCategoryOptions = HR_EXPENSE_CLAIM_CATEGORIES.map(
  (category) => ({
    value: category,
    label: formatExpenseEnumLabel(category),
  }),
);

export const hrExpenseStatusFilterOptions = HR_EXPENSE_CLAIM_STATUSES.map(
  (status) => ({
    value: status,
    label: formatExpenseEnumLabel(status),
  }),
);
