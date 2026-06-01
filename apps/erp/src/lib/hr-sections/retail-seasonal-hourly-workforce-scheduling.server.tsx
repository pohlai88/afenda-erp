import {
  hrIndustryRwsUiCopy,
  parseHrIndustryRwsSearchParams,
  toHrIndustryRwsPageModelInput,
} from "@afenda/feature-hr-suite/metadata";
import {
  buildHrIndustryRwsPageModel,
  HrIndustryRwsAccessDeniedPanel,
  HrIndustryRwsSection,
  requireHrIndustryRwsRead,
} from "@afenda/feature-hr-suite/server";
import {
  ExecutionAccessDeniedError,
  ExecutionContextRequiredError,
} from "@afenda/kernel/execution";
import type { Metadata } from "next";

import type { HrSectionPageProps } from "./registry.server";

export const metadata: Metadata = {
  title: `${hrIndustryRwsUiCopy.page.title} — HR`,
  description: hrIndustryRwsUiCopy.page.description,
};

function isRwsAccessFailure(error: unknown) {
  return (
    error instanceof ExecutionContextRequiredError ||
    error instanceof ExecutionAccessDeniedError
  );
}

async function resolveRwsPageContext(
  searchParams?: HrSectionPageProps["searchParams"],
) {
  const [guard, resolvedSearchParams] = await Promise.all([
    requireHrIndustryRwsRead(),
    searchParams ?? Promise.resolve(undefined),
  ]);
  const parsed = parseHrIndustryRwsSearchParams(resolvedSearchParams);
  const visibleEmployeeIds = await guard.resolveVisibleEmployeeIds({
    scope: guard.canWrite || guard.canApprove ? "org" : "team",
  });

  return toHrIndustryRwsPageModelInput({
    organizationId: guard.organization.id,
    visibleEmployeeIds,
    canWrite: guard.canWrite,
    canApprove: guard.canApprove,
    canReadAudit: guard.canReadAudit,
    canReadRestricted: guard.canReadRestricted,
    canReadLaborCost: guard.canReadLaborCost,
    canExposeIntegrations: guard.canExposeIntegrations,
    searchParams: parsed,
  });
}

export default async function HrRetailSeasonalHourlyWorkforceSchedulingPage({
  searchParams,
}: HrSectionPageProps) {
  try {
    const modelInput = await resolveRwsPageContext(searchParams);
    const pageModel = await buildHrIndustryRwsPageModel(modelInput);
    return <HrIndustryRwsSection pageModel={pageModel} />;
  } catch (error) {
    if (isRwsAccessFailure(error)) {
      return <HrIndustryRwsAccessDeniedPanel />;
    }
    throw error;
  }
}
