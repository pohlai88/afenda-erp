import { hrComplianceUiCopy, toHrCompliancePageModelInput } from "@afenda/feature-hr-suite/metadata";
import {
  buildHrCompliancePageModel,
  HrComplianceAccessDeniedPanel,
  HrComplianceWorkbenchSection,
  requireHrComplianceRead,
} from "@afenda/feature-hr-suite/server";
import {
  ExecutionAccessDeniedError,
  ExecutionContextRequiredError,
} from "@afenda/kernel/execution";
import type { Metadata } from "next";

import type { HrSectionPageProps } from "./registry.server";

export const metadata: Metadata = {
  title: `${hrComplianceUiCopy.page.title} — HR`,
  description: hrComplianceUiCopy.page.description,
};

function isComplianceAccessFailure(error: unknown) {
  return (
    error instanceof ExecutionContextRequiredError ||
    error instanceof ExecutionAccessDeniedError
  );
}

export default async function HrCompliancePage({
  searchParams,
}: HrSectionPageProps) {
  let guard: Awaited<ReturnType<typeof requireHrComplianceRead>>;
  let resolvedSearchParams:
    | Record<string, string | string[] | undefined>
    | undefined;

  try {
    [guard, resolvedSearchParams] = await Promise.all([
      requireHrComplianceRead(),
      searchParams ?? Promise.resolve(undefined),
    ]);
  } catch (error) {
    if (isComplianceAccessFailure(error)) {
      return <HrComplianceAccessDeniedPanel />;
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

  return <HrComplianceWorkbenchSection model={model} />;
}
