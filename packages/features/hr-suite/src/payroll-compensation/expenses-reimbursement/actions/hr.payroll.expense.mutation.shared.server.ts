import { revalidatePath } from "next/cache";

import {
  actionSuccess,
  type ActionResult,
} from "@afenda/governed-surface/schemas";

import { toExpenseActionFailure } from "../data/hr.payroll.expense-action-result.shared";

/** Revalidate when expense workbench routes ship; path is centralized for foundation agents. */
export const HR_PAYROLL_EXPENSE_REVALIDATE_PATH = "/hr/expenses";

export async function finalizeHrExpenseMutation(
  mutate: () => Promise<void>,
): Promise<ActionResult> {
  try {
    await mutate();
  } catch (error) {
    return toExpenseActionFailure(error);
  }

  revalidatePath(HR_PAYROLL_EXPENSE_REVALIDATE_PATH);
  return actionSuccess(undefined);
}
