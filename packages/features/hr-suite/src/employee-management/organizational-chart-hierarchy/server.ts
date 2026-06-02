import React from "react";

import {
  ExecutionAccessDeniedError,
  ExecutionContextRequiredError,
} from "@afenda/kernel/execution";
import { SectionPanel } from "@afenda/ui";

import {
  HrOrgAccessDeniedPanel,
  HrOrgWorkbenchSection,
} from "./components/hr.workforce.org-section.component.server";
import {
  buildHrOrgPageModel,
  toHrOrgPageModelInput,
} from "./data";
import { requireHrOrgRead } from "./policies/hr.workforce.org-access.policy.server";

export * from "./actions";
export * from "./data";
export * from "./policies";
export * from "./schemas";
export * from "./contracts";
export * from "./events";

export { HrOrgAccessDeniedPanel, HrOrgWorkbenchSection };

export function HrOrgAccessDenied() {
  return React.createElement(HrOrgAccessDeniedPanel);
}

export function HrOrgSection({
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

function isOrgAccessFailure(error: unknown) {
  return (
    error instanceof ExecutionAccessDeniedError ||
    error instanceof ExecutionContextRequiredError
  );
}

export async function renderHrOrgPage(
  searchParams?: Promise<Record<string, string | string[] | undefined>>,
) {
  let guard: Awaited<ReturnType<typeof requireHrOrgRead>>;
  let resolvedSearchParams: Record<string, string | string[] | undefined> | undefined;

  try {
    [guard, resolvedSearchParams] = await Promise.all([
      requireHrOrgRead(),
      searchParams ?? Promise.resolve(undefined),
    ]);
  } catch (error) {
    if (isOrgAccessFailure(error)) {
      return React.createElement(HrOrgAccessDeniedPanel);
    }
    throw error;
  }

  const model = await buildHrOrgPageModel(
    toHrOrgPageModelInput({
      organizationId: guard.organization.id,
      canWrite: guard.hasCapability("hr.org.write"),
      searchParams: resolvedSearchParams,
    }),
  );

  return React.createElement(HrOrgWorkbenchSection, { model });
}
