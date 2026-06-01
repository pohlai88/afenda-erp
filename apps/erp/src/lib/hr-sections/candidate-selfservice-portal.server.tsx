import {
  hrTalentRssUiCopy,
  parseHrTalentRssSearchParams,
  toHrTalentRssPageModelInput,
} from "@afenda/feature-hr-suite/metadata";
import {
  buildHrTalentRssPageModel,
  HrTalentRssAccessDeniedPanel,
  HrTalentRssSection,
  requireHrTalentRssRead,
} from "@afenda/feature-hr-suite/server";
import {
  ExecutionAccessDeniedError,
  ExecutionContextRequiredError,
} from "@afenda/kernel/execution";
import type { Metadata } from "next";

import type { HrSectionPageProps } from "./registry.server";

export const metadata: Metadata = {
  title: `${hrTalentRssUiCopy.page.title} - HR`,
  description: hrTalentRssUiCopy.page.description,
};

function isRssAccessFailure(error: unknown) {
  return (
    error instanceof ExecutionContextRequiredError ||
    error instanceof ExecutionAccessDeniedError
  );
}

async function resolveRssPageContext(
  searchParams?: HrSectionPageProps["searchParams"],
) {
  const [guard, resolvedSearchParams] = await Promise.all([
    requireHrTalentRssRead(),
    searchParams ?? Promise.resolve(undefined),
  ]);
  const parsed = parseHrTalentRssSearchParams(resolvedSearchParams);
  const visibleCandidateIds = await guard.resolveVisibleCandidateIds();

  return toHrTalentRssPageModelInput({
    organizationId: guard.organization.id,
    visibleCandidateIds,
    canWrite: guard.canWrite,
    canApprove: guard.canApprove,
    canReadAudit: guard.canReadAudit,
    canReadRestricted: guard.canReadRestricted,
    canExposeIntegrations: guard.canExposeIntegrations,
    searchParams: parsed,
  });
}

export default async function HrTalentRssPage({
  searchParams,
}: HrSectionPageProps) {
  try {
    const modelInput = await resolveRssPageContext(searchParams);
    const pageModel = await buildHrTalentRssPageModel(modelInput);
    return <HrTalentRssSection pageModel={pageModel} />;
  } catch (error) {
    if (isRssAccessFailure(error)) {
      return <HrTalentRssAccessDeniedPanel />;
    }
    throw error;
  }
}
