import React from "react";

import {
  ExecutionAccessDeniedError,
  ExecutionContextRequiredError,
} from "@afenda/kernel/execution";
import { SectionPanel } from "@afenda/ui";

import {
  HrOffboardingAccessDeniedPanel,
  HrOffboardingWorkbenchSection,
} from "./components/hr.workforce.offboarding-section.component.server";
import {
  buildHrOffboardingPageModel,
  toHrOffboardingPageModelInput,
} from "./data";
import { requireHrOffboardingRead } from "./policies/hr.workforce.offboarding-access.policy.server";

export * from "./actions";
export * from "./data";
export * from "./policies";
export * from "./schemas";
export * from "./contracts";

export { HrOffboardingAccessDeniedPanel, HrOffboardingWorkbenchSection };

export function HrOffboardingAccessDenied() {
  return React.createElement(HrOffboardingAccessDeniedPanel);
}

export function HrOffboardingSection({
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

function isOffboardingAccessFailure(error: unknown) {
  return (
    error instanceof ExecutionAccessDeniedError ||
    error instanceof ExecutionContextRequiredError
  );
}

export async function renderHrOffboardingPage(
  searchParams?: Promise<Record<string, string | string[] | undefined>>,
) {
  let guard: Awaited<ReturnType<typeof requireHrOffboardingRead>>;
  let resolvedSearchParams: Record<string, string | string[] | undefined> | undefined;

  try {
    [guard, resolvedSearchParams] = await Promise.all([
      requireHrOffboardingRead(),
      searchParams ?? Promise.resolve(undefined),
    ]);
  } catch (error) {
    if (isOffboardingAccessFailure(error)) {
      return React.createElement(HrOffboardingAccessDeniedPanel);
    }
    throw error;
  }

  const model = await buildHrOffboardingPageModel(
    toHrOffboardingPageModelInput({
      organizationId: guard.organization.id,
      canWrite: guard.hasCapability("hr.offboarding.write"),
      canViewSensitive: guard.canViewSensitive,
      searchParams: resolvedSearchParams,
    }),
  );

  return React.createElement(HrOffboardingWorkbenchSection, { model });
}
