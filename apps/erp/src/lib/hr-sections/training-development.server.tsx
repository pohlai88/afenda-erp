import {
  hrTalentTrainingUiCopy,
  parseHrTrainingSearchParams,
  toHrTrainingPageModelInput,
} from "@afenda/feature-hr-suite/metadata";
import {
  buildHrTrainingPageModel,
  HrTrainingAccessDeniedPanel,
  HrTrainingSection,
  requireHrTrainingRead,
} from "@afenda/feature-hr-suite/server";
import {
  ExecutionAccessDeniedError,
  ExecutionContextRequiredError,
} from "@afenda/kernel/execution";
import type { Metadata } from "next";

import type { HrSectionPageProps } from "./registry.server";

export const metadata: Metadata = {
  title: `${hrTalentTrainingUiCopy.page.title} — HR`,
  description: hrTalentTrainingUiCopy.page.description,
};

function isTrainingAccessFailure(error: unknown) {
  return (
    error instanceof ExecutionContextRequiredError ||
    error instanceof ExecutionAccessDeniedError
  );
}

async function resolveTrainingPageContext(
  searchParams?: HrSectionPageProps["searchParams"],
) {
  const [guard, resolvedSearchParams] = await Promise.all([
    requireHrTrainingRead(),
    searchParams ?? Promise.resolve(undefined),
  ]);
  const parsed = parseHrTrainingSearchParams(resolvedSearchParams);
  const visibleEmployeeIds = await guard.resolveVisibleEmployeeIds({
    scope: guard.canWrite || guard.canApprove ? "org" : "team",
  });

  return toHrTrainingPageModelInput({
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

export default async function HrTrainingDevelopmentPage({
  searchParams,
}: HrSectionPageProps) {
  try {
    const modelInput = await resolveTrainingPageContext(searchParams);
    const pageModel = await buildHrTrainingPageModel(modelInput);
    return <HrTrainingSection pageModel={pageModel} />;
  } catch (error) {
    if (isTrainingAccessFailure(error)) {
      return <HrTrainingAccessDeniedPanel />;
    }
    throw error;
  }
}
