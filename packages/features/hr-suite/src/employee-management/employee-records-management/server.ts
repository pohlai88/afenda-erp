import React from "react";

import {
  ExecutionAccessDeniedError,
  ExecutionContextRequiredError,
} from "@afenda/kernel/execution";
import { SectionPanel } from "@afenda/ui";

import {
  HrRecordsAccessDeniedPanel,
  HrRecordsDetailNotFoundPanel,
  HrRecordsDetailSection,
  HrRecordsWorkbenchSection,
} from "./components";
import {
  buildHrEmployeeRecordDetailPageModel,
  buildHrRecordsPageModel,
  toHrEmployeeRecordDetailPageModelInput,
  toHrRecordsPageModelInput,
} from "./data";
import { requireHrRecordsRead } from "./policies/hr.workforce.records-access.policy.server";

/**
 * Server door — employee-management/employee-records-management
 */
export * from "./actions";
export * from "./data";
export * from "./events";
export * from "./policies";
export * from "./schemas";
export {
  hrWorkforceRecordsReadPermission,
  hrWorkforceRecordsWritePermission,
  hrWorkforceRecordsSensitiveReadPermission,
} from "./contracts/hr.workforce.records.contract";
export {
  hrRecordsRoutePaths,
  type HrRecordsRoutePath,
} from "./contracts/hr.workforce.records-route.contract";

export {
  HrRecordsAccessDeniedPanel,
  HrRecordsDetailNotFoundPanel,
  HrRecordsDetailSection,
  HrRecordsWorkbenchSection,
};

export function HrRecordsAccessDenied() {
  return React.createElement(HrRecordsAccessDeniedPanel);
}

export function HrEmployeesSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return React.createElement(
    SectionPanel,
    { headingLevel: 2, title, description },
    children,
  );
}

function isRecordsAccessFailure(error: unknown) {
  return (
    error instanceof ExecutionAccessDeniedError ||
    error instanceof ExecutionContextRequiredError
  );
}

export async function renderHrRecordsPage(
  searchParams?: Promise<Record<string, string | string[] | undefined>>,
) {
  let guard: Awaited<ReturnType<typeof requireHrRecordsRead>>;
  let resolvedSearchParams: Record<string, string | string[] | undefined> | undefined;

  try {
    [guard, resolvedSearchParams] = await Promise.all([
      requireHrRecordsRead(),
      searchParams ?? Promise.resolve(undefined),
    ]);
  } catch (error) {
    if (isRecordsAccessFailure(error)) {
      return React.createElement(HrRecordsAccessDeniedPanel);
    }
    throw error;
  }

  const model = await buildHrRecordsPageModel(
    toHrRecordsPageModelInput({
      organizationId: guard.organization.id,
      canWrite: guard.hasCapability("hr.employees.write"),
      canViewSensitive: guard.canViewSensitive,
      searchParams: resolvedSearchParams,
    }),
  );

  return React.createElement(HrRecordsWorkbenchSection, { model });
}

export async function renderHrEmployeesPage(
  searchParams?: Promise<Record<string, string | string[] | undefined>>,
) {
  return renderHrRecordsPage(searchParams);
}

export async function renderHrEmployeeRecordDetailPage(recordId: string) {
  let guard: Awaited<ReturnType<typeof requireHrRecordsRead>>;

  try {
    guard = await requireHrRecordsRead();
  } catch (error) {
    if (isRecordsAccessFailure(error)) {
      return React.createElement(HrRecordsAccessDeniedPanel);
    }
    throw error;
  }

  const model = await buildHrEmployeeRecordDetailPageModel(
    toHrEmployeeRecordDetailPageModelInput({
      organizationId: guard.organization.id,
      employeeId: recordId,
      canViewSensitive: guard.canViewSensitive,
    }),
  );

  return model
    ? React.createElement(HrRecordsDetailSection, { model })
    : null;
}

/** @deprecated Use requireHrRecordsRead from this slice. */
export { requireHrRecordsRead as requireHrEmployeesRead } from "./policies/hr.workforce.records-access.policy.server";
/** @deprecated Use requireHrRecordsWrite from this slice. */
export { requireHrRecordsWrite as requireHrEmployeesWrite } from "./policies/hr.workforce.records-access.policy.server";
/** @deprecated Use buildHrRecordsPageModel from this slice. */
export { buildHrRecordsPageModel as buildHrEmployeesPageModel } from "./data/hr.workforce.records.page-model.server";
/** @deprecated Use HrRecordsAccessDeniedPanel from this slice. */
export { HrRecordsAccessDeniedPanel as HrEmployeesAccessDenied } from "./components/hr.workforce.records-section.component.server";
