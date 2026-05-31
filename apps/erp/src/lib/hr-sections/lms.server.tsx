import { hrLmsUiCopy } from "@afenda/feature-hr-suite/metadata";
import {
  buildHrLmsAuditPageModel,
  buildHrLmsHubPageModel,
  buildHrLmsReportsPageModel,
  HrLmsAccessDeniedPanel,
  HrLmsAuditSection,
  HrLmsHubSection,
  HrLmsReportsSection,
  requireHrLmsRead,
} from "@afenda/feature-hr-suite/server";
import {
  ExecutionAccessDeniedError,
  ExecutionContextRequiredError,
} from "@afenda/kernel/execution";
import type { Metadata } from "next";

import type { HrSectionPageProps } from "./registry.server";

export const metadata: Metadata = {
  title: "Learning Management — HR",
  description: "Online courses, learning paths, certifications, and compliance training.",
};

function isLmsAccessFailure(error: unknown) {
  return (
    error instanceof ExecutionContextRequiredError ||
    error instanceof ExecutionAccessDeniedError
  );
}

async function resolveLmsPageContext(searchParams?: HrSectionPageProps["searchParams"]) {
  const [guard, resolvedSearchParams] = await Promise.all([
    requireHrLmsRead(),
    searchParams ?? Promise.resolve(undefined),
  ]);

  const visibleEmployeeIds = await guard.resolveVisibleEmployeeIds({
    scope: guard.canViewOrgAdmin ? "org" : guard.canViewTeamProgress ? "team" : "self",
  });

  return {
    guard,
    organizationId: guard.context.organizationId,
    visibleEmployeeIds,
    searchParams: resolvedSearchParams,
  };
}

export default async function HrLmsPage({ searchParams }: HrSectionPageProps) {
  try {
    const ctx = await resolveLmsPageContext(searchParams);
    const model = await buildHrLmsHubPageModel({
      organizationId: ctx.organizationId,
      searchParams: ctx.searchParams as Record<string, string | string[] | undefined>,
      visibleEmployeeIds: ctx.visibleEmployeeIds,
      canViewTeam: ctx.guard.canViewTeamProgress,
      canViewAdmin: ctx.guard.canViewOrgAdmin,
    });
    return <HrLmsHubSection model={model} />;
  } catch (error) {
    if (isLmsAccessFailure(error)) {
      return <HrLmsAccessDeniedPanel />;
    }
    throw error;
  }
}

export async function renderHrLmsReportsPage(searchParams?: HrSectionPageProps["searchParams"]) {
  const ctx = await resolveLmsPageContext(searchParams);
  const model = await buildHrLmsReportsPageModel({
    organizationId: ctx.organizationId,
    searchParams: ctx.searchParams as Record<string, string | string[] | undefined>,
    visibleEmployeeIds: ctx.visibleEmployeeIds,
  });
  return <HrLmsReportsSection model={model} />;
}

export async function renderHrLmsAuditPage() {
  const ctx = await resolveLmsPageContext();
  const model = await buildHrLmsAuditPageModel({
    organizationId: ctx.organizationId,
  });
  return <HrLmsAuditSection model={model} />;
}

export { hrLmsUiCopy };
