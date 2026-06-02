
import React from "react";

import {
  ExecutionAccessDeniedError,
  ExecutionContextRequiredError,
} from "@afenda/kernel/execution";

import {
  HrExpenseAccessDeniedPanel,
  HrExpenseWorkbenchSection,
} from "./components/hr.payroll.expense-section.component.server";
import { buildHrExpensePageModel } from "./data/hr.payroll.expense.page-model.server";
import { toHrExpensePageModelInput } from "./data/hr.payroll.expense-search-params.parse.shared";
import { requireHrExpenseRead } from "./policies/hr.payroll.expense-access.policy.server";

export {
  HrExpenseAccessDeniedPanel,
  HrExpenseWorkbenchSection,
} from "./components/hr.payroll.expense-section.component.server";

export { buildHrExpensePageModel } from "./data/hr.payroll.expense.page-model.server";
export { toHrExpensePageModelInput } from "./data/hr.payroll.expense-search-params.parse.shared";

export {
  requireHrExpenseApprove,
  requireHrExpenseRead,
  requireHrExpenseWrite,
} from "./policies/hr.payroll.expense-access.policy.server";

function isExpenseAccessFailure(error: unknown) {
  return (
    error instanceof ExecutionAccessDeniedError ||
    error instanceof ExecutionContextRequiredError
  );
}

export async function renderHrExpensePage(
  searchParams?: Promise<Record<string, string | string[] | undefined>>,
) {
  let guard: Awaited<ReturnType<typeof requireHrExpenseRead>>;
  let resolvedSearchParams: Record<string, string | string[] | undefined> | undefined;

  try {
    [guard, resolvedSearchParams] = await Promise.all([
      requireHrExpenseRead(),
      searchParams ?? Promise.resolve(undefined),
    ]);
  } catch (error) {
    if (isExpenseAccessFailure(error)) {
      return React.createElement(HrExpenseAccessDeniedPanel);
    }
    throw error;
  }

  const pageModel = await buildHrExpensePageModel(
    toHrExpensePageModelInput({
      organizationId: guard.organization.id,
      canWrite: guard.hasCapability("hr.expense.write"),
      canApprove: guard.canApprove,
      actorUserId: guard.session.id,
      searchParams: resolvedSearchParams,
    }),
  );

  return React.createElement(HrExpenseWorkbenchSection, { pageModel });
}
