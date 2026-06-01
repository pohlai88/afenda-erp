import {
  hrTalentEngUiCopy,
  parseHrTalentEngSearchParams,
  toHrTalentEngPageModelInput,
} from "@afenda/feature-hr-suite/metadata";
import {
  buildHrTalentEngPageModel,
  HrTalentEngAccessDeniedPanel,
  HrTalentEngSection,
  requireHrTalentEngRead,
} from "@afenda/feature-hr-suite/server";
import {
  ExecutionAccessDeniedError,
  ExecutionContextRequiredError,
} from "@afenda/kernel/execution";
import type { Metadata } from "next";

import type { HrSectionPageProps } from "./registry.server";

export const metadata: Metadata = {
  title: `${hrTalentEngUiCopy.page.title} - HR`,
  description: hrTalentEngUiCopy.page.description,
};

function isEngAccessFailure(error: unknown) {
  return (
    error instanceof ExecutionContextRequiredError ||
    error instanceof ExecutionAccessDeniedError
  );
}

async function resolveEngPageContext(
  searchParams?: HrSectionPageProps["searchParams"],
) {
  const [guard, resolvedSearchParams] = await Promise.all([
    requireHrTalentEngRead(),
    searchParams ?? Promise.resolve(undefined),
  ]);
  const parsed = parseHrTalentEngSearchParams(resolvedSearchParams);

  return toHrTalentEngPageModelInput({
    organizationId: guard.organization.id,
    actorUserId: guard.session.id,
    visibleEmployeeIds: await guard.resolveVisibleEmployeeIds(),
    canWrite: guard.canWrite,
    canApprove: guard.canApprove,
    canReadAudit: guard.canReadAudit,
    canReadRestricted: guard.canReadRestricted,
    canExposeIntegrations: guard.canExposeIntegrations,
    searchParams: parsed,
  });
}

export default async function HrTalentEngPage({
  searchParams,
}: HrSectionPageProps) {
  try {
    const modelInput = await resolveEngPageContext(searchParams);
    const pageModel = await buildHrTalentEngPageModel(modelInput);
    return <HrTalentEngSection pageModel={pageModel} />;
  } catch (error) {
    if (isEngAccessFailure(error)) {
      return <HrTalentEngAccessDeniedPanel />;
    }
    throw error;
  }
}
