import {
  hrPayrollUiCopy,
  toHrPayrollPageModelInput,
} from "@afenda/feature-hr-suite/metadata";
import {
  buildHrPayrollPageModel,
  HrPayrollAccessDeniedPanel,
  HrPayrollWorkbenchSection,
  requireHrPayrollRead,
} from "@afenda/feature-hr-suite/server";
import {
  ExecutionAccessDeniedError,
  ExecutionContextRequiredError,
} from "@afenda/kernel/execution";
import type { Metadata } from "next";

import type { HrSectionPageProps } from "./registry.server";

export const metadata: Metadata = {
  title: `${hrPayrollUiCopy.page.title} — HR`,
  description: hrPayrollUiCopy.page.description,
};

function isPayrollAccessFailure(error: unknown) {
  return (
    error instanceof ExecutionContextRequiredError ||
    error instanceof ExecutionAccessDeniedError
  );
}

export default async function HrPayrollProcessingPage({
  searchParams,
}: HrSectionPageProps) {
  let guard: Awaited<ReturnType<typeof requireHrPayrollRead>>;
  let resolvedSearchParams:
    | Record<string, string | string[] | undefined>
    | undefined;

  try {
    [guard, resolvedSearchParams] = await Promise.all([
      requireHrPayrollRead(),
      searchParams ?? Promise.resolve(undefined),
    ]);
  } catch (error) {
    if (isPayrollAccessFailure(error)) {
      return <HrPayrollAccessDeniedPanel />;
    }
    throw error;
  }

  const pageModel = await buildHrPayrollPageModel(
    toHrPayrollPageModelInput({
      organizationId: guard.organization.id,
      actorUserId: guard.session.id,
      canWrite: guard.hasCapability("hr.payroll.write"),
      searchParams: resolvedSearchParams,
    }),
  );

  return <HrPayrollWorkbenchSection pageModel={pageModel} />;
}
