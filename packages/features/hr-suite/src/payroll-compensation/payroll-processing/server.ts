import React from "react";

import {
  ExecutionAccessDeniedError,
  ExecutionContextRequiredError,
} from "@afenda/kernel/execution";

import {
  HrPayrollAccessDeniedPanel,
  HrPayrollWorkbenchSection,
} from "./components";
import {
  buildHrPayrollPageModel,
  toHrPayrollPageModelInput,
} from "./data";
import { requireHrPayrollRead } from "./policies/hr.payroll.processing-access.policy.server";

export * from "./actions";
export * from "./data";
export * from "./events";
export * from "./policies";
export * from "./schemas";
export * from "./contracts";

export {
  requireHrPayrollRead,
  requireHrPayrollWrite,
  requireHrPayrollApprove,
  requireHrPayrollAuditRead,
  requireHrPayrollEssRead,
  HR_PAYROLL_READ_CAPABILITY,
  HR_PAYROLL_WRITE_CAPABILITY,
  HR_PAYROLL_APPROVE_CAPABILITY,
  HR_PAYROLL_AUDIT_READ_CAPABILITY,
  HR_PAYROLL_ESS_READ_CAPABILITY,
} from "./policies/hr.payroll.processing-access.policy.server";

export {
  PAYROLL_REQUIREMENT_COVERAGE,
  PAYROLL_ACCEPTANCE_CRITERIA_COVERAGE,
  assertPayrollCoverageComplete,
} from "./data/hr.payroll.processing-acceptance-coverage.shared";

export {
  buildHrPayrollPageModel,
  buildHrPayrollAuditPageModel,
  type HrPayrollPageModel,
  type HrPayrollAuditPageModel,
} from "./data/hr.payroll.processing.page-model.server";

export {
  HrPayrollAccessDeniedPanel,
  HrPayrollWorkbenchSection,
  HrPayrollAuditSection,
} from "./components";

function isPayrollAccessFailure(error: unknown) {
  return (
    error instanceof ExecutionAccessDeniedError ||
    error instanceof ExecutionContextRequiredError
  );
}

export async function renderHrPayrollPage(
  searchParams?: Promise<Record<string, string | string[] | undefined>>,
) {
  let guard: Awaited<ReturnType<typeof requireHrPayrollRead>>;
  let resolvedSearchParams: Record<string, string | string[] | undefined> | undefined;

  try {
    [guard, resolvedSearchParams] = await Promise.all([
      requireHrPayrollRead(),
      searchParams ?? Promise.resolve(undefined),
    ]);
  } catch (error) {
    if (isPayrollAccessFailure(error)) {
      return React.createElement(HrPayrollAccessDeniedPanel);
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

  return React.createElement(HrPayrollWorkbenchSection, { pageModel });
}

export async function renderHrPayrollProcessingPage(
  searchParams?: Promise<Record<string, string | string[] | undefined>>,
) {
  return renderHrPayrollPage(searchParams);
}
