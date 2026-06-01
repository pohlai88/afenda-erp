import {
  hrIndustryUcbUiCopy,
  parseHrIndustryUcbSearchParams,
  toHrIndustryUcbPageModelInput,
} from "@afenda/feature-hr-suite/metadata";
import {
  buildHrIndustryUcbPageModel,
  HrIndustryUcbAccessDeniedPanel,
  HrIndustryUcbSection,
  requireHrIndustryUcbRead,
} from "@afenda/feature-hr-suite/server";
import {
  ExecutionAccessDeniedError,
  ExecutionContextRequiredError,
} from "@afenda/kernel/execution";
import type { Metadata } from "next";

import type { HrSectionPageProps } from "./registry.server";

export const metadata: Metadata = {
  title: `${hrIndustryUcbUiCopy.page.title} - HR`,
  description: hrIndustryUcbUiCopy.page.description,
};

function isUcbAccessFailure(error: unknown) {
  return (
    error instanceof ExecutionContextRequiredError ||
    error instanceof ExecutionAccessDeniedError
  );
}

async function resolveUcbPageContext(
  searchParams?: HrSectionPageProps["searchParams"],
) {
  const [guard, resolvedSearchParams] = await Promise.all([
    requireHrIndustryUcbRead(),
    searchParams ?? Promise.resolve(undefined),
  ]);
  const parsed = parseHrIndustryUcbSearchParams(resolvedSearchParams);
  const visibleEmployeeIds = await guard.resolveVisibleEmployeeIds({
    scope: guard.canWrite || guard.canApprove ? "org" : "team",
  });

  return toHrIndustryUcbPageModelInput({
    organizationId: guard.organization.id,
    visibleEmployeeIds,
    canWrite: guard.canWrite,
    canApprove: guard.canApprove,
    canReadAudit: guard.canReadAudit,
    canReadRestricted: guard.canReadRestricted,
    canManageGrievances: guard.canManageGrievances,
    canReadLegalReferences: guard.canReadLegalReferences,
    canExposePayroll: guard.canExposePayroll,
    canExposeIntegrations: guard.canExposeIntegrations,
    canExportReports: guard.canExportReports,
    searchParams: parsed,
  });
}

export default async function HrUnionManagementPage({
  searchParams,
}: HrSectionPageProps) {
  try {
    const modelInput = await resolveUcbPageContext(searchParams);
    const pageModel = await buildHrIndustryUcbPageModel(modelInput);
    return <HrIndustryUcbSection pageModel={pageModel} />;
  } catch (error) {
    if (isUcbAccessFailure(error)) {
      return <HrIndustryUcbAccessDeniedPanel />;
    }
    throw error;
  }
}
