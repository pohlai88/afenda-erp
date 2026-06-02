import React from "react";

import {
  ExecutionAccessDeniedError,
  ExecutionContextRequiredError,
} from "@afenda/kernel/execution";
import { SectionPanel } from "@afenda/ui";

import {
  HrLifecycleAccessDeniedPanel,
  HrLifecycleWorkbenchSection,
} from "./components/hr.workforce.lifecycle-section.component.server";
import {
  buildHrLifecyclePageModel,
  toHrLifecyclePageModelInput,
} from "./data";
import { requireHrLifecycleRead } from "./policies/hr.workforce.lifecycle-access.policy.server";

/**
 * Server door — employee-management/employee-lifecycle-management
 */
export * from "./actions";
export * from "./data";
export * from "./events";
export * from "./policies";
export * from "./schemas";
export {
  hrWorkforceLifecycleReadPermission,
  hrWorkforceLifecycleWritePermission,
} from "./contracts/hr.workforce.lifecycle.contract";
export {
  hrLifecycleRoutePaths,
  type HrLifecycleRoutePath,
} from "./contracts/hr.workforce.lifecycle-route.contract";

export { HrLifecycleAccessDeniedPanel, HrLifecycleWorkbenchSection };

export function HrLifecycleAccessDenied() {
  return React.createElement(HrLifecycleAccessDeniedPanel);
}

export function HrLifecycleSection({
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

function isLifecycleAccessFailure(error: unknown) {
  return (
    error instanceof ExecutionAccessDeniedError ||
    error instanceof ExecutionContextRequiredError
  );
}

export async function renderHrLifecyclePage(
  searchParams?: Promise<Record<string, string | string[] | undefined>>,
) {
  let guard: Awaited<ReturnType<typeof requireHrLifecycleRead>>;
  let resolvedSearchParams: Record<string, string | string[] | undefined> | undefined;

  try {
    [guard, resolvedSearchParams] = await Promise.all([
      requireHrLifecycleRead(),
      searchParams ?? Promise.resolve(undefined),
    ]);
  } catch (error) {
    if (isLifecycleAccessFailure(error)) {
      return React.createElement(HrLifecycleAccessDeniedPanel);
    }
    throw error;
  }

  const model = await buildHrLifecyclePageModel(
    toHrLifecyclePageModelInput({
      organizationId: guard.organization.id,
      canWrite: guard.hasCapability("hr.lifecycle.write"),
      searchParams: resolvedSearchParams,
    }),
  );

  return React.createElement(HrLifecycleWorkbenchSection, { model });
}
