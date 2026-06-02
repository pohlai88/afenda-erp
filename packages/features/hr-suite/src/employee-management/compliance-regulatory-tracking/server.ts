import React from "react";

import {
  ExecutionAccessDeniedError,
  ExecutionContextRequiredError,
} from "@afenda/kernel/execution";
import { SectionPanel } from "@afenda/ui";

import {
  HrComplianceAccessDeniedPanel,
  HrComplianceWorkbenchSection,
} from "./components/hr.workforce.compliance-section.component.server";
import {
  buildHrCompliancePageModel,
  toHrCompliancePageModelInput,
} from "./data";
import { requireHrComplianceRead } from "./policies/hr.workforce.compliance-access.policy.server";

/**
 * Server door — employee-management/compliance-regulatory-tracking
 */
export * from "./actions";
export * from "./data";
export * from "./events";
export * from "./policies";
export * from "./schemas";
export * from "./contracts";

export { HrComplianceAccessDeniedPanel, HrComplianceWorkbenchSection };

export function HrComplianceAccessDenied() {
  return React.createElement(HrComplianceAccessDeniedPanel);
}

export function HrComplianceSection({
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

function isComplianceAccessFailure(error: unknown) {
  return (
    error instanceof ExecutionAccessDeniedError ||
    error instanceof ExecutionContextRequiredError
  );
}

export async function renderHrCompliancePage(
  searchParams?: Promise<Record<string, string | string[] | undefined>>,
) {
  let guard: Awaited<ReturnType<typeof requireHrComplianceRead>>;
  let resolvedSearchParams: Record<string, string | string[] | undefined> | undefined;

  try {
    [guard, resolvedSearchParams] = await Promise.all([
      requireHrComplianceRead(),
      searchParams ?? Promise.resolve(undefined),
    ]);
  } catch (error) {
    if (isComplianceAccessFailure(error)) {
      return React.createElement(HrComplianceAccessDeniedPanel);
    }
    throw error;
  }

  const model = await buildHrCompliancePageModel(
    toHrCompliancePageModelInput({
      organizationId: guard.organization.id,
      canWrite: guard.hasCapability("hr.compliance.write"),
      canViewSensitive: guard.canViewSensitive,
      searchParams: resolvedSearchParams,
    }),
  );

  return React.createElement(HrComplianceWorkbenchSection, { model });
}
