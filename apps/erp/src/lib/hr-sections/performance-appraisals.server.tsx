import {
  hrPerformanceAppraisalsUiCopy,
  parseHrPerformanceAppraisalsSearchParams,
  toHrPerformanceAppraisalsPageModelInput,
} from "@afenda/feature-hr-suite/metadata";
import {
  buildHrPerformanceAppraisalsPageModel,
  HrPerformanceAppraisalsAccessDeniedPanel,
  HrPerformanceAppraisalsSection,
  requireHrPerformanceRead,
} from "@afenda/feature-hr-suite/server";
import {
  ExecutionAccessDeniedError,
  ExecutionContextRequiredError,
} from "@afenda/kernel/execution";
import type { Metadata } from "next";

import type { HrSectionPageProps } from "./registry.server";

export const metadata: Metadata = {
  title: `${hrPerformanceAppraisalsUiCopy.page.title} — HR`,
  description: hrPerformanceAppraisalsUiCopy.page.description,
};

function isPerformanceAccessFailure(error: unknown) {
  return (
    error instanceof ExecutionContextRequiredError ||
    error instanceof ExecutionAccessDeniedError
  );
}

async function resolvePerformancePageContext(
  searchParams?: HrSectionPageProps["searchParams"],
) {
  const [guard, resolvedSearchParams] = await Promise.all([
    requireHrPerformanceRead(),
    searchParams ?? Promise.resolve(undefined),
  ]);

  const visibleEmployeeIds = await guard.resolveVisibleEmployeeIds({
    scope: guard.canWritePerformance ? "org" : "team",
  });
  const parsed = parseHrPerformanceAppraisalsSearchParams(resolvedSearchParams);

  return toHrPerformanceAppraisalsPageModelInput({
    organizationId: guard.organization.id,
    visibleEmployeeIds,
    canWritePerformance: guard.canWritePerformance,
    canReadAudit: guard.canReadAudit,
    canReadCompensationOutcome: guard.canReadCompensationOutcome,
    searchParams: parsed,
  });
}

export default async function HrPerformanceAppraisalsPage({
  searchParams,
}: HrSectionPageProps) {
  try {
    const modelInput = await resolvePerformancePageContext(searchParams);
    const pageModel = await buildHrPerformanceAppraisalsPageModel(modelInput);
    return <HrPerformanceAppraisalsSection pageModel={pageModel} />;
  } catch (error) {
    if (isPerformanceAccessFailure(error)) {
      return <HrPerformanceAppraisalsAccessDeniedPanel />;
    }
    throw error;
  }
}
