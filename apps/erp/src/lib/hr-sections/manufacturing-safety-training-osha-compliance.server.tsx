import {
  hrIndustryMscUiCopy,
  parseHrIndustryMscSearchParams,
  toHrIndustryMscPageModelInput,
} from "@afenda/feature-hr-suite/metadata";
import {
  buildHrIndustryMscPageModel,
  HrIndustryMscAccessDeniedPanel,
  HrIndustryMscSection,
  requireHrIndustryMscRead,
} from "@afenda/feature-hr-suite/server";
import {
  ExecutionAccessDeniedError,
  ExecutionContextRequiredError,
} from "@afenda/kernel/execution";
import type { Metadata } from "next";

import type { HrSectionPageProps } from "./registry.server";

export const metadata: Metadata = {
  title: `${hrIndustryMscUiCopy.page.title} — HR`,
  description: hrIndustryMscUiCopy.page.description,
};

function isMscAccessFailure(error: unknown) {
  return (
    error instanceof ExecutionContextRequiredError ||
    error instanceof ExecutionAccessDeniedError
  );
}

async function resolveMscPageContext(
  searchParams?: HrSectionPageProps["searchParams"],
) {
  const [guard, resolvedSearchParams] = await Promise.all([
    requireHrIndustryMscRead(),
    searchParams ?? Promise.resolve(undefined),
  ]);
  const parsed = parseHrIndustryMscSearchParams(resolvedSearchParams);
  const visibleEmployeeIds = await guard.resolveVisibleEmployeeIds({
    scope: guard.canWrite || guard.canApprove ? "org" : "team",
  });

  return toHrIndustryMscPageModelInput({
    organizationId: guard.organization.id,
    visibleEmployeeIds,
    canWrite: guard.canWrite,
    canApprove: guard.canApprove,
    canReadAudit: guard.canReadAudit,
    canReadRestricted: guard.canReadRestricted,
    canExposeIntegrations: guard.canExposeIntegrations,
    searchParams: parsed,
  });
}

export default async function HrManufacturingSafetyTrainingOshaCompliancePage({
  searchParams,
}: HrSectionPageProps) {
  try {
    const modelInput = await resolveMscPageContext(searchParams);
    const pageModel = await buildHrIndustryMscPageModel(modelInput);
    return <HrIndustryMscSection pageModel={pageModel} />;
  } catch (error) {
    if (isMscAccessFailure(error)) {
      return <HrIndustryMscAccessDeniedPanel />;
    }
    throw error;
  }
}
