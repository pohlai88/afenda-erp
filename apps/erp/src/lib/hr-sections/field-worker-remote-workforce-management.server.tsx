import {
  hrIndustryFrmUiCopy,
  parseHrIndustryFrmSearchParams,
  toHrIndustryFrmPageModelInput,
} from "@afenda/feature-hr-suite/metadata";
import {
  buildHrIndustryFrmPageModel,
  HrIndustryFrmAccessDeniedPanel,
  HrIndustryFrmSection,
  requireHrIndustryFrmRead,
} from "@afenda/feature-hr-suite/server";
import {
  ExecutionAccessDeniedError,
  ExecutionContextRequiredError,
} from "@afenda/kernel/execution";
import type { Metadata } from "next";

import type { HrSectionPageProps } from "./registry.server";

export const metadata: Metadata = {
  title: `${hrIndustryFrmUiCopy.page.title} — HR`,
  description: hrIndustryFrmUiCopy.page.description,
};

function isFrmAccessFailure(error: unknown) {
  return (
    error instanceof ExecutionContextRequiredError ||
    error instanceof ExecutionAccessDeniedError
  );
}

async function resolveFrmPageContext(
  searchParams?: HrSectionPageProps["searchParams"],
) {
  const [guard, resolvedSearchParams] = await Promise.all([
    requireHrIndustryFrmRead(),
    searchParams ?? Promise.resolve(undefined),
  ]);
  const parsed = parseHrIndustryFrmSearchParams(resolvedSearchParams);
  const visibleEmployeeIds = await guard.resolveVisibleEmployeeIds({
    scope: guard.canWrite || guard.canApprove ? "org" : "team",
  });

  return toHrIndustryFrmPageModelInput({
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

export default async function HrFieldWorkerRemoteWorkforceManagementPage({
  searchParams,
}: HrSectionPageProps) {
  try {
    const modelInput = await resolveFrmPageContext(searchParams);
    const pageModel = await buildHrIndustryFrmPageModel(modelInput);
    return <HrIndustryFrmSection pageModel={pageModel} />;
  } catch (error) {
    if (isFrmAccessFailure(error)) {
      return <HrIndustryFrmAccessDeniedPanel />;
    }
    throw error;
  }
}
