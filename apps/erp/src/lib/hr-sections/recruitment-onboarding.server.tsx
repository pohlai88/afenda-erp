import {
  hrRonUiCopy,
  parseHrRonSearchParams,
  toHrRonPageModelInput,
} from "@afenda/feature-hr-suite/metadata";
import {
  buildHrRonPageModel,
  HrRonAccessDeniedPanel,
  HrRonSection,
  requireHrRonRead,
} from "@afenda/feature-hr-suite/server";
import {
  ExecutionAccessDeniedError,
  ExecutionContextRequiredError,
} from "@afenda/kernel/execution";
import type { Metadata } from "next";

import type { HrSectionPageProps } from "./registry.server";

export const metadata: Metadata = {
  title: `${hrRonUiCopy.page.title} — HR`,
  description: hrRonUiCopy.page.description,
};

function isRonAccessFailure(error: unknown) {
  return (
    error instanceof ExecutionContextRequiredError ||
    error instanceof ExecutionAccessDeniedError
  );
}

async function resolveRonPageContext(
  searchParams?: HrSectionPageProps["searchParams"],
) {
  const [guard, resolvedSearchParams] = await Promise.all([
    requireHrRonRead(),
    searchParams ?? Promise.resolve(undefined),
  ]);
  const parsed = parseHrRonSearchParams(resolvedSearchParams);

  return toHrRonPageModelInput({
    organizationId: guard.organization.id,
    canWrite: guard.canWrite,
    canApproveRequisitions: guard.canApproveRequisitions,
    canApproveOffers: guard.canApproveOffers,
    canReadSensitiveCandidateData: guard.canReadSensitiveCandidateData,
    canReadFinance: guard.canReadFinance,
    canReadIt: guard.canReadIt,
    canReadAudit: guard.canReadAudit,
    searchParams: parsed,
  });
}

export default async function HrRecruitmentOnboardingPage({
  searchParams,
}: HrSectionPageProps) {
  try {
    const modelInput = await resolveRonPageContext(searchParams);
    const pageModel = await buildHrRonPageModel(modelInput);
    return <HrRonSection pageModel={pageModel} />;
  } catch (error) {
    if (isRonAccessFailure(error)) {
      return <HrRonAccessDeniedPanel />;
    }
    throw error;
  }
}
