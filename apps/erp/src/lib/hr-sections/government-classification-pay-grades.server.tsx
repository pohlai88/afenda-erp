import {
  hrIndustryGpgUiCopy,
  parseHrIndustryGpgSearchParams,
  toHrIndustryGpgPageModelInput,
} from "@afenda/feature-hr-suite/metadata";
import {
  buildHrIndustryGpgPageModel,
  HrIndustryGpgAccessDeniedPanel,
  HrIndustryGpgSection,
  requireHrIndustryGpgRead,
} from "@afenda/feature-hr-suite/server";
import {
  ExecutionAccessDeniedError,
  ExecutionContextRequiredError,
} from "@afenda/kernel/execution";
import type { Metadata } from "next";

import type { HrSectionPageProps } from "./registry.server";

export const metadata: Metadata = {
  title: `${hrIndustryGpgUiCopy.page.title} — HR`,
  description: hrIndustryGpgUiCopy.page.description,
};

function isGpgAccessFailure(error: unknown) {
  return (
    error instanceof ExecutionContextRequiredError ||
    error instanceof ExecutionAccessDeniedError
  );
}

async function resolveGpgPageContext(
  searchParams?: HrSectionPageProps["searchParams"],
) {
  const [guard, resolvedSearchParams] = await Promise.all([
    requireHrIndustryGpgRead(),
    searchParams ?? Promise.resolve(undefined),
  ]);
  const parsed = parseHrIndustryGpgSearchParams(resolvedSearchParams);
  const visibleEmployeeIds = await guard.resolveVisibleEmployeeIds({
    scope: guard.canWrite || guard.canApprove ? "org" : "team",
  });

  return toHrIndustryGpgPageModelInput({
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

export default async function HrGovernmentClassificationPayGradesPage({
  searchParams,
}: HrSectionPageProps) {
  try {
    const modelInput = await resolveGpgPageContext(searchParams);
    const pageModel = await buildHrIndustryGpgPageModel(modelInput);
    return <HrIndustryGpgSection pageModel={pageModel} />;
  } catch (error) {
    if (isGpgAccessFailure(error)) {
      return <HrIndustryGpgAccessDeniedPanel />;
    }
    throw error;
  }
}
