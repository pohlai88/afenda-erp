import {
  hrWorkforceEssUiCopy,
  parseHrWorkforceEssSearchParams,
  toHrWorkforceEssPageModelInput,
} from "@afenda/feature-hr-suite/metadata";
import {
  buildHrWorkforceEssPageModel,
  HrWorkforceEssAccessDeniedPanel,
  HrWorkforceEssSection,
  requireHrWorkforceEssRead,
} from "@afenda/feature-hr-suite/server";
import {
  ExecutionAccessDeniedError,
  ExecutionContextRequiredError,
} from "@afenda/kernel/execution";
import type { Metadata } from "next";

import type { HrSectionPageProps } from "./registry.server";

export const metadata: Metadata = {
  title: `${hrWorkforceEssUiCopy.page.title} - HR`,
  description: hrWorkforceEssUiCopy.page.description,
};

function isEssAccessFailure(error: unknown) {
  return (
    error instanceof ExecutionContextRequiredError ||
    error instanceof ExecutionAccessDeniedError
  );
}

async function resolveEssPageContext(
  searchParams?: HrSectionPageProps["searchParams"],
) {
  const [guard, resolvedSearchParams] = await Promise.all([
    requireHrWorkforceEssRead(),
    searchParams ?? Promise.resolve(undefined),
  ]);
  const parsed = parseHrWorkforceEssSearchParams(resolvedSearchParams);

  return toHrWorkforceEssPageModelInput({
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

export default async function HrWorkforceEssPage({
  searchParams,
}: HrSectionPageProps) {
  try {
    const modelInput = await resolveEssPageContext(searchParams);
    const pageModel = await buildHrWorkforceEssPageModel(modelInput);
    return <HrWorkforceEssSection pageModel={pageModel} />;
  } catch (error) {
    if (isEssAccessFailure(error)) {
      return <HrWorkforceEssAccessDeniedPanel />;
    }
    throw error;
  }
}
