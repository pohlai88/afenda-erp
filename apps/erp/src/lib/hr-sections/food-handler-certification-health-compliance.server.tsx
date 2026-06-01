import {
  hrIndustryFhcUiCopy,
  parseHrIndustryFhcSearchParams,
  toHrIndustryFhcPageModelInput,
} from "@afenda/feature-hr-suite/metadata";
import {
  buildHrIndustryFhcPageModel,
  HrIndustryFhcAccessDeniedPanel,
  HrIndustryFhcSection,
  requireHrIndustryFhcRead,
} from "@afenda/feature-hr-suite/server";
import {
  ExecutionAccessDeniedError,
  ExecutionContextRequiredError,
} from "@afenda/kernel/execution";
import type { Metadata } from "next";

import type { HrSectionPageProps } from "./registry.server";

export const metadata: Metadata = {
  title: `${hrIndustryFhcUiCopy.page.title} — HR`,
  description: hrIndustryFhcUiCopy.page.description,
};

function isFhcAccessFailure(error: unknown) {
  return (
    error instanceof ExecutionContextRequiredError ||
    error instanceof ExecutionAccessDeniedError
  );
}

async function resolveFhcPageContext(
  searchParams?: HrSectionPageProps["searchParams"],
) {
  const [guard, resolvedSearchParams] = await Promise.all([
    requireHrIndustryFhcRead(),
    searchParams ?? Promise.resolve(undefined),
  ]);
  const parsed = parseHrIndustryFhcSearchParams(resolvedSearchParams);
  const visibleEmployeeIds = await guard.resolveVisibleEmployeeIds({
    scope: guard.canWrite || guard.canApprove ? "org" : "team",
  });

  return toHrIndustryFhcPageModelInput({
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

export default async function HrFoodHandlerCertificationHealthCompliancePage({
  searchParams,
}: HrSectionPageProps) {
  try {
    const modelInput = await resolveFhcPageContext(searchParams);
    const pageModel = await buildHrIndustryFhcPageModel(modelInput);
    return <HrIndustryFhcSection pageModel={pageModel} />;
  } catch (error) {
    if (isFhcAccessFailure(error)) {
      return <HrIndustryFhcAccessDeniedPanel />;
    }
    throw error;
  }
}
