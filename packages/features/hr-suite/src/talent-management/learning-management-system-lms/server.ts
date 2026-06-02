import React from "react";
import {
  ExecutionAccessDeniedError,
  ExecutionContextRequiredError,
} from "@afenda/kernel/execution";

type HrRawSearchParams = Record<string, string | string[] | undefined> | undefined;
type HrSearchParamsInput = HrRawSearchParams | Promise<HrRawSearchParams>;

export * from "./actions";
export * from "./data";
export * from "./events";
export * from "./policies";
export * from "./schemas";
export * from "./contracts";

export {
  requireHrLmsRead,
  requireHrLmsWrite,
  canHrLmsViewEmployeeLearning,
  canHrLmsModifyLearningRecord,
  HR_LMS_READ_CAPABILITY,
  HR_LMS_WRITE_CAPABILITY,
} from "./policies/hr.talent.lms-access.policy.server";

export {
  LMS_REQUIREMENT_COVERAGE,
  LMS_ACCEPTANCE_CRITERIA_COVERAGE,
  assertLmsCoverageComplete,
  assertLmsAcceptanceCriteriaComplete,
} from "./data/hr.talent.lms-acceptance-coverage.shared";

export {
  buildHrLmsHubPageModel,
  buildHrLmsReportsPageModel,
  buildHrLmsAuditPageModel,
  type HrLmsHubPageModel,
  type HrLmsReportsPageModel,
  type HrLmsAuditPageModel,
} from "./data/hr.talent.lms.page-model.server";

export {
  getLmsComplianceCompletionSnapshot,
  getLmsOnboardingCompletionSnapshot,
  getLmsTrainingDevelopmentRefs,
} from "./data/hr.talent.lms-integration.server";

export {
  buildHrLmsReportRows,
  listHrLmsLearningHistory,
} from "./data/hr.talent.lms-reports.server";

export {
  emitHrLmsAuditTrailEvent,
  listHrLmsAuditTrail,
  hrTalentLmsAuditActions,
} from "./data/hr.talent.lms-audit.server";

export {
  HrLmsAccessDeniedPanel,
  HrLmsHubSection,
  HrLmsReportsSection,
  HrLmsAuditSection,
} from "./components";

import {
  buildHrLmsAuditPageModel,
  buildHrLmsHubPageModel,
  buildHrLmsReportsPageModel,
} from "./data/hr.talent.lms.page-model.server";
import { requireHrLmsRead } from "./policies/hr.talent.lms-access.policy.server";
import {
  HrLmsAccessDeniedPanel,
  HrLmsAuditSection,
  HrLmsHubSection,
  HrLmsReportsSection,
} from "./components";

function isHrLmsAccessFailure(error: unknown) {
  return (
    error instanceof ExecutionContextRequiredError ||
    error instanceof ExecutionAccessDeniedError
  );
}

async function resolveHrLmsPageContext(searchParams?: HrSearchParamsInput) {
  const [guard, resolvedSearchParams] = await Promise.all([
    requireHrLmsRead(),
    searchParams ?? Promise.resolve(undefined),
  ]);

  const visibleEmployeeIds = await guard.resolveVisibleEmployeeIds({
    scope: guard.canViewOrgAdmin
      ? "org"
      : guard.canViewTeamProgress
        ? "team"
        : "self",
  });

  return {
    guard,
    organizationId: guard.context.organizationId,
    visibleEmployeeIds,
    searchParams: resolvedSearchParams,
  };
}

export async function buildHrLmsHubPageModelForRequest(
  searchParams?: HrSearchParamsInput,
) {
  const context = await resolveHrLmsPageContext(searchParams);
  return buildHrLmsHubPageModel({
    organizationId: context.organizationId,
    searchParams: context.searchParams,
    visibleEmployeeIds: context.visibleEmployeeIds,
    canViewTeam: context.guard.canViewTeamProgress,
    canViewAdmin: context.guard.canViewOrgAdmin,
  });
}

export async function buildHrLmsReportsPageModelForRequest(
  searchParams?: HrSearchParamsInput,
) {
  const context = await resolveHrLmsPageContext(searchParams);
  return buildHrLmsReportsPageModel({
    organizationId: context.organizationId,
    searchParams: context.searchParams,
    visibleEmployeeIds: context.visibleEmployeeIds,
  });
}

export async function buildHrLmsAuditPageModelForRequest() {
  const context = await resolveHrLmsPageContext();
  return buildHrLmsAuditPageModel({
    organizationId: context.organizationId,
  });
}

export async function renderHrLmsHubPage(searchParams?: HrSearchParamsInput) {
  try {
    const model = await buildHrLmsHubPageModelForRequest(searchParams);
    return React.createElement(HrLmsHubSection, { model });
  } catch (error) {
    if (isHrLmsAccessFailure(error)) {
      return React.createElement(HrLmsAccessDeniedPanel);
    }
    throw error;
  }
}

export async function renderHrLmsReportsPage(searchParams?: HrSearchParamsInput) {
  const model = await buildHrLmsReportsPageModelForRequest(searchParams);
  return React.createElement(HrLmsReportsSection, { model });
}

export async function renderHrLmsAuditPage() {
  const model = await buildHrLmsAuditPageModelForRequest();
  return React.createElement(HrLmsAuditSection, { model });
}
