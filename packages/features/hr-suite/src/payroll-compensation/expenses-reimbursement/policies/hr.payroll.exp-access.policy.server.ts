import type { AppCapability } from "@afenda/auth";
import {
  hasExecutionPermission,
  requireExecutionContext,
  requireExecutionPermission,
  type ExecutionContext,
} from "@afenda/kernel/execution";

import {
  HR_EXPENSE_APPROVE_CAPABILITY,
  HR_EXPENSE_EXCEPTION_APPROVE_CAPABILITY,
  HR_EXPENSE_FINANCE_APPROVE_CAPABILITY,
  HR_EXPENSE_READ_CAPABILITY,
  HR_EXPENSE_WRITE_CAPABILITY,
} from "../schemas/hr.payroll.exp-constants.shared";

export class HrPayrollExpenseAccessDeniedError extends Error {
  constructor(message = "Access denied for expense reimbursement.") {
    super(message);
    this.name = "HrPayrollExpenseAccessDeniedError";
  }
}

export type HrPayrollExpenseExecutionGuard = {
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
  canFinanceApprove: boolean;
  canExceptionApprove: boolean;
  hasCapability(capability: AppCapability): boolean;
};

function toHrPayrollExpenseExecutionGuard(
  context: ExecutionContext,
): HrPayrollExpenseExecutionGuard {
  const canApprove = hasExecutionPermission(
    context,
    HR_EXPENSE_APPROVE_CAPABILITY,
  );
  const canFinanceApprove =
    hasExecutionPermission(context, HR_EXPENSE_FINANCE_APPROVE_CAPABILITY) ||
    hasExecutionPermission(context, HR_EXPENSE_WRITE_CAPABILITY);
  const canExceptionApprove =
    hasExecutionPermission(context, HR_EXPENSE_EXCEPTION_APPROVE_CAPABILITY) ||
    canApprove;

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
    canFinanceApprove,
    canExceptionApprove,
    hasCapability: (capability) =>
      hasExecutionPermission(context, capability),
  };
}

export async function requireHrPayrollExpenseRead(): Promise<HrPayrollExpenseExecutionGuard> {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, HR_EXPENSE_READ_CAPABILITY);
  return toHrPayrollExpenseExecutionGuard(context);
}

export async function requireHrPayrollExpenseApprove(): Promise<HrPayrollExpenseExecutionGuard> {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, HR_EXPENSE_READ_CAPABILITY);
  requireExecutionPermission(context, HR_EXPENSE_APPROVE_CAPABILITY);
  return toHrPayrollExpenseExecutionGuard(context);
}
