import React from "react";

import {
  ExecutionAccessDeniedError,
  ExecutionContextRequiredError,
} from "@afenda/kernel/execution";
import { SectionPanel } from "@afenda/ui";

import {
  HrDocumentsAccessDeniedPanel,
  HrDocumentsWorkbenchSection,
} from "./components/hr.workforce.documents-section.component.server";
import {
  buildHrDocumentsPageModel,
  toHrDocumentsPageModelInput,
} from "./data";
import { requireHrDocumentsRead } from "./policies/hr.workforce.documents-access.policy.server";

/**
 * Server door — employee-management/documents-management
 */
export * from "./actions";
export * from "./data";
export * from "./events";
export * from "./policies";
export * from "./schemas";
export * from "./contracts";

export { HrDocumentsAccessDeniedPanel, HrDocumentsWorkbenchSection };

export function HrDocumentsAccessDenied() {
  return React.createElement(HrDocumentsAccessDeniedPanel);
}

export function HrDocumentsSection({
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

function isDocumentsAccessFailure(error: unknown) {
  return (
    error instanceof ExecutionAccessDeniedError ||
    error instanceof ExecutionContextRequiredError
  );
}

export async function renderHrDocumentsPage(
  searchParams?: Promise<Record<string, string | string[] | undefined>>,
) {
  let guard: Awaited<ReturnType<typeof requireHrDocumentsRead>>;
  let resolvedSearchParams: Record<string, string | string[] | undefined> | undefined;

  try {
    [guard, resolvedSearchParams] = await Promise.all([
      requireHrDocumentsRead(),
      searchParams ?? Promise.resolve(undefined),
    ]);
  } catch (error) {
    if (isDocumentsAccessFailure(error)) {
      return React.createElement(HrDocumentsAccessDeniedPanel);
    }
    throw error;
  }

  const model = await buildHrDocumentsPageModel(
    toHrDocumentsPageModelInput({
      organizationId: guard.organization.id,
      canWrite: guard.hasCapability("hr.documents.write"),
      canViewSensitive: guard.canViewSensitive,
      searchParams: resolvedSearchParams,
    }),
  );

  return React.createElement(HrDocumentsWorkbenchSection, { model });
}
