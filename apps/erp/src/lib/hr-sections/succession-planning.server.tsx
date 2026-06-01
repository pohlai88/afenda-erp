import {
  hrTalentSuccessionUiCopy,
  parseHrSuccessionSearchParams,
  toHrSuccessionPageModelInput,
} from "@afenda/feature-hr-suite/metadata";
import {
  buildHrSuccessionPageModel,
  HrSuccessionAccessDeniedPanel,
  HrSuccessionSection,
  requireHrSuccessionRead,
} from "@afenda/feature-hr-suite/server";
import {
  ExecutionAccessDeniedError,
  ExecutionContextRequiredError,
} from "@afenda/kernel/execution";
import type { Metadata } from "next";

import type { HrSectionPageProps } from "./registry.server";

export const metadata: Metadata = {
  title: `${hrTalentSuccessionUiCopy.page.title} — HR`,
  description: hrTalentSuccessionUiCopy.page.description,
};

function isSuccessionAccessFailure(error: unknown) {
  return (
    error instanceof ExecutionContextRequiredError ||
    error instanceof ExecutionAccessDeniedError
  );
}

async function resolveSuccessionPageContext(
  searchParams?: HrSectionPageProps["searchParams"],
) {
  const [guard, resolvedSearchParams] = await Promise.all([
    requireHrSuccessionRead(),
    searchParams ?? Promise.resolve(undefined),
  ]);
  const parsed = parseHrSuccessionSearchParams(resolvedSearchParams);
  const visibleEmployeeIds = await guard.resolveVisibleEmployeeIds({
    scope: guard.canWrite || guard.canApprove ? "org" : "team",
  });
  const pageModelInput = {
    organizationId: guard.organization.id,
    visibleEmployeeIds,
    canWrite: guard.canWrite,
    canReview: guard.canReview,
    canApprove: guard.canApprove,
    canReadAudit: guard.canReadAudit,
    canReadRestricted: guard.canReadRestricted,
    canExposeLifecycle: guard.canExposeLifecycle,
    searchParams: parsed,
  };

  return toHrSuccessionPageModelInput(pageModelInput);
}

export default async function HrSuccessionPlanningPage({
  searchParams,
}: HrSectionPageProps) {
  try {
    const modelInput = await resolveSuccessionPageContext(searchParams);
    const pageModel = await buildHrSuccessionPageModel(modelInput);
    return <HrSuccessionSection pageModel={pageModel} />;
  } catch (error) {
    if (isSuccessionAccessFailure(error)) {
      return <HrSuccessionAccessDeniedPanel />;
    }
    throw error;
  }
}
