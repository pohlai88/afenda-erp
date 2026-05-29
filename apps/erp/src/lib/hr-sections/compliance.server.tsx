import { hrComplianceUiCopy, parseHrComplianceSearchParams } from "@afenda/feature-hr-suite/metadata";
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

  const {
    obligationSearch,
    exceptionSearch,
    laborLawSearch,
    policyAcknowledgementSearch,
    safetyTrainingSearch,
    workplaceSafetySearch,
    workEligibilitySearch,
    workAuthDocumentSearch,
    filingSearch,
    regulatoryCalendarSearch,
    alertsSearch,
  } = parseHrComplianceSearchParams(resolvedSearchParams);

  const { organization } = guard;
  const canWrite = guard.hasCapability("hr.compliance.write");

  const model = await buildHrCompliancePageModel({
    organizationId: organization.id,
    canWrite,
    obligationSearch,
    exceptionSearch,
    laborLawSearch,
    policyAcknowledgementSearch,
    safetyTrainingSearch,
    workplaceSafetySearch,
    workEligibilitySearch,
    workAuthDocumentSearch,
    filingSearch,
    regulatoryCalendarSearch,
    alertsSearch,
  });

  return <HrComplianceWorkbenchSection model={model} />;
}
