import {
  hrExpenseUiCopy,
  toHrExpensePageModelInput,
} from "@afenda/feature-hr-suite/metadata";
import {
  buildHrExpensePageModel,
  HrExpenseAccessDeniedPanel,
  HrExpenseWorkbenchSection,
  requireHrExpenseRead,
} from "@afenda/feature-hr-suite/server";
import {
  ExecutionAccessDeniedError,
  ExecutionContextRequiredError,
} from "@afenda/kernel/execution";
import type { Metadata } from "next";

import type { HrSectionPageProps } from "./registry.server";

export const metadata: Metadata = {
  title: `${hrExpenseUiCopy.page.title} — HR`,
  description: hrExpenseUiCopy.page.description,
};

function isExpenseAccessFailure(error: unknown) {
  return (
    error instanceof ExecutionContextRequiredError ||
    error instanceof ExecutionAccessDeniedError
  );
}

export default async function HrExpensesPage({ searchParams }: HrSectionPageProps) {
  let guard: Awaited<ReturnType<typeof requireHrExpenseRead>>;
  let resolvedSearchParams:
    | Record<string, string | string[] | undefined>
    | undefined;

  try {
    [guard, resolvedSearchParams] = await Promise.all([
      requireHrExpenseRead(),
      searchParams ?? Promise.resolve(undefined),
    ]);
  } catch (error) {
    if (isExpenseAccessFailure(error)) {
      return <HrExpenseAccessDeniedPanel />;
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

  return <HrExpenseWorkbenchSection pageModel={pageModel} />;
}
