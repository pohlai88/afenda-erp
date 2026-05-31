import {
  hrCsfUiCopy,
  parseHrCsfSearchParams,
  toHrCsfHubPageModelInput,
} from "@afenda/feature-hr-suite/metadata";
import {
  buildHrCsfHubPageModel,
  HrCsfAccessDeniedPanel,
  HrCsfHubSection,
  requireHrCsfRead,
} from "@afenda/feature-hr-suite/server";
import {
  ExecutionAccessDeniedError,
  ExecutionContextRequiredError,
} from "@afenda/kernel/execution";
import type { Metadata } from "next";

import type { HrSectionPageProps } from "./registry.server";

export const metadata: Metadata = {
  title: `${hrCsfUiCopy.page.title} — HR`,
  description: hrCsfUiCopy.page.description,
};

function isCsfAccessFailure(error: unknown) {
  return (
    error instanceof ExecutionContextRequiredError ||
    error instanceof ExecutionAccessDeniedError
  );
}

async function resolveCsfPageContext(searchParams?: HrSectionPageProps["searchParams"]) {
  const [guard, resolvedSearchParams] = await Promise.all([
    requireHrCsfRead(),
    searchParams ?? Promise.resolve(undefined),
  ]);

  const visibleEmployeeIds = await guard.resolveVisibleEmployeeIds({
    scope: guard.canWriteCsf ? "org" : "team",
  });

  const parsed = parseHrCsfSearchParams(resolvedSearchParams);

  const modelInput = toHrCsfHubPageModelInput({
    organizationId: guard.organization.id,
    canWriteCsf: guard.canWriteCsf,
    canReadAudit: guard.canReadAudit,
    canReadReadiness: guard.canReadReadiness,
    canExposePerformance: guard.canExposePerformance,
    canExposeSuccession: guard.canExposeSuccession,
    visibleEmployeeIds,
    lmsEnabled: true,
    searchParams: parsed,
  });

  return { guard, modelInput, parsed };
}

export default async function HrCompetencySkillsPage({
  searchParams,
}: HrSectionPageProps) {
  try {
    const { modelInput } = await resolveCsfPageContext(searchParams);
    const pageModel = await buildHrCsfHubPageModel(modelInput);
    return <HrCsfHubSection pageModel={pageModel} />;
  } catch (error) {
    if (isCsfAccessFailure(error)) {
      return <HrCsfAccessDeniedPanel />;
    }
    throw error;
  }
}

export async function renderHrCsfReportsPage(searchParams?: HrSectionPageProps["searchParams"]) {
  const {
    buildHrCsfReportsPageModel,
    HrCsfReportsSection,
  } = await import("@afenda/feature-hr-suite/server");

  const { modelInput } = await resolveCsfPageContext(searchParams);
  const pageModel = await buildHrCsfReportsPageModel(modelInput);
  return <HrCsfReportsSection pageModel={pageModel} />;
}

export async function renderHrCsfAuditPage(searchParams?: HrSectionPageProps["searchParams"]) {
  const {
    buildHrCsfAuditPageModel,
    HrCsfAuditSection,
    HrCsfAccessDeniedPanel: Denied,
  } = await import("@afenda/feature-hr-suite/server");

  const { modelInput, guard } = await resolveCsfPageContext(searchParams);
  if (!guard.canReadAudit) {
    return <Denied />;
  }
  const pageModel = await buildHrCsfAuditPageModel(modelInput);
  if (!pageModel) {
    return <Denied />;
  }
  return <HrCsfAuditSection pageModel={pageModel} />;
}

export async function renderHrCsfMatchingPage(searchParams?: HrSectionPageProps["searchParams"]) {
  const {
    buildHrCsfMatchingPageModel,
    HrCsfMatchingSection,
  } = await import("@afenda/feature-hr-suite/server");

  const { modelInput } = await resolveCsfPageContext(searchParams);
  const pageModel = await buildHrCsfMatchingPageModel(modelInput);
  return <HrCsfMatchingSection pageModel={pageModel} />;
}
