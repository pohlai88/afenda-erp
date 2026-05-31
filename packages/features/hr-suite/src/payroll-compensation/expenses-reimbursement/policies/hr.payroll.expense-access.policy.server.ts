import type { AppCapability } from "@afenda/auth";
import {
  hasExecutionPermission,
  requireExecutionContext,
  requireExecutionPermission,
  type ExecutionContext,
} from "@afenda/kernel/execution";

import {
  HR_EXPENSE_APPROVE_CAPABILITY,
  HR_EXPENSE_READ_CAPABILITY,
  HR_EXPENSE_WRITE_CAPABILITY,
} from "../schemas/hr.payroll.expense-constants.shared";

export type HrExpenseExecutionGuard = {
  context: ExecutionContext;
  session: { id: string };
  organization: {
    id: string;
    slug: string;
    locale: string;
    role: ExecutionContext["role"];
    capabilities: readonly AppCapability[];
  };
  canApprove: boolean;
  hasCapability(capability: AppCapability): boolean;
};

function toHrExpenseExecutionGuard(
  context: ExecutionContext,
): HrExpenseExecutionGuard {
  const canApprove = hasExecutionPermission(
    context,
    HR_EXPENSE_APPROVE_CAPABILITY,
  );

  return {
    context,
    session: { id: context.userId },
    organization: {
      id: context.organizationId,
      slug: context.organizationSlug,
      locale: context.locale,
      role: context.role,
      capabilities: context.capabilities,
    },
    canApprove,
    hasCapability(capability: AppCapability) {
      return hasExecutionPermission(context, capability);
    },
  };
}

/** HRM-EXP-026 — read expense claims and reports. */
export async function requireHrExpenseRead() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, HR_EXPENSE_READ_CAPABILITY);
  return toHrExpenseExecutionGuard(context);
}

export async function requireHrExpenseWrite() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, HR_EXPENSE_WRITE_CAPABILITY);
  return toHrExpenseExecutionGuard(context);
}

/** HRM-EXP-018 — approve, reject, return, or request clarification. */
export async function requireHrExpenseApprove() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, HR_EXPENSE_READ_CAPABILITY);
  requireExecutionPermission(context, HR_EXPENSE_APPROVE_CAPABILITY);
  return toHrExpenseExecutionGuard(context);
}

export {
  HR_EXPENSE_APPROVE_CAPABILITY,
  HR_EXPENSE_READ_CAPABILITY,
  HR_EXPENSE_WRITE_CAPABILITY,
};
