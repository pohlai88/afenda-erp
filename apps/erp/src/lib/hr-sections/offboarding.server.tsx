import {
  hrOffboardingUiCopy,
  toHrOffboardingPageModelInput,
} from "@afenda/feature-hr-suite/metadata";
import {
  buildHrOffboardingPageModel,
  HrOffboardingAccessDeniedPanel,
  HrOffboardingWorkbenchSection,
  requireHrOffboardingRead,
} from "@afenda/feature-hr-suite/server";
import {
  ExecutionAccessDeniedError,
  ExecutionContextRequiredError,
} from "@afenda/kernel/execution";
import type { Metadata } from "next";

import type { HrSectionPageProps } from "./registry.server";

export const metadata: Metadata = {
  title: `${hrOffboardingUiCopy.page.title} — HR`,
  description: hrOffboardingUiCopy.page.description,
};

function isOffboardingAccessFailure(error: unknown) {
  return (
    error instanceof ExecutionContextRequiredError ||
    error instanceof ExecutionAccessDeniedError
  );
}

export default async function HrOffboardingPage({
  searchParams,
}: HrSectionPageProps) {
  let guard: Awaited<ReturnType<typeof requireHrOffboardingRead>>;
  let resolvedSearchParams:
    | Record<string, string | string[] | undefined>
    | undefined;

  try {
    [guard, resolvedSearchParams] = await Promise.all([
      requireHrOffboardingRead(),
      searchParams ?? Promise.resolve(undefined),
    ]);
  } catch (error) {
    if (isOffboardingAccessFailure(error)) {
      return <HrOffboardingAccessDeniedPanel />;
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

  return <HrOffboardingWorkbenchSection model={model} />;
}
