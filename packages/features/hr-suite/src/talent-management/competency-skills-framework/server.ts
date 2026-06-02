import React from "react";
import {
  ExecutionAccessDeniedError,
  ExecutionContextRequiredError,
} from "@afenda/kernel/execution";

import {
  parseHrCsfSearchParams,
  toHrCsfHubPageModelInput,
} from "./data/hr.talent.csf-search-params.parse.shared";

type HrRawSearchParams = Record<string, string | string[] | undefined> | undefined;
type HrSearchParamsInput = HrRawSearchParams | Promise<HrRawSearchParams>;

export * from "./actions";
export * from "./data";
export * from "./events";
export * from "./policies";
export * from "./schemas";
export * from "./contracts";

export {
  requireHrCsfRead,
  requireHrCsfWrite,
  HR_CSF_READ_CAPABILITY,
  HR_CSF_WRITE_CAPABILITY,
} from "./policies/hr.talent.csf-access.policy.server";

export {
  CSF_REQUIREMENT_COVERAGE,
  CSF_ACCEPTANCE_CRITERIA_COVERAGE,
  assertCsfCoverageComplete,
  assertCsfAcceptanceCriteriaComplete,
} from "./data/hr.talent.csf-acceptance-coverage.shared";

export {
  buildHrCsfHubPageModel,
  buildHrCsfReportsPageModel,
  buildHrCsfAuditPageModel,
  buildHrCsfMatchingPageModel,
  type HrCsfHubPageModel,
  type HrCsfReportsPageModel,
  type HrCsfAuditPageModel,
  type HrCsfMatchingPageModel,
} from "./data/hr.talent.csf.page-model.server";

export {
  listHrCsfTrainingDevelopmentGapExposure,
  listHrCsfLmsLearningRecommendations,
  listHrCsfPerformanceAppraisalCompetencyRefs,
  listHrCsfSuccessionReadinessIndicators,
  publishHrCsfIntegrationExposures,
  compareCareerPathSkillRequirements,
  findEmployeesMatchingRequiredSkills,
  buildHrCsfReportRows,
  listHrCsfAuditTrailWindow,
  emitHrCsfAuditTrailEvent,
} from "./data";

export {
  HrCsfAccessDeniedPanel,
  HrCsfHubSection,
  HrCsfReportsSection,
  HrCsfAuditSection,
  HrCsfMatchingSection,
  HrCsfSectionNav,
} from "./components";

import {
  buildHrCsfAuditPageModel,
  buildHrCsfHubPageModel,
  buildHrCsfMatchingPageModel,
  buildHrCsfReportsPageModel,
} from "./data/hr.talent.csf.page-model.server";
import { requireHrCsfRead } from "./policies/hr.talent.csf-access.policy.server";
import {
  HrCsfAccessDeniedPanel,
  HrCsfAuditSection,
  HrCsfHubSection,
  HrCsfMatchingSection,
  HrCsfReportsSection,
} from "./components";

function isHrCsfAccessFailure(error: unknown) {
  return (
    error instanceof ExecutionContextRequiredError ||
    error instanceof ExecutionAccessDeniedError
  );
}

async function resolveHrCsfPageModelInput(searchParams?: HrSearchParamsInput) {
  const [guard, resolvedSearchParams] = await Promise.all([
    requireHrCsfRead(),
    searchParams ?? Promise.resolve(undefined),
  ]);

  const visibleEmployeeIds = await guard.resolveVisibleEmployeeIds({
    scope: guard.canWriteCsf ? "org" : "team",
  });

  return {
    guard,
    modelInput: toHrCsfHubPageModelInput({
      organizationId: guard.organization.id,
      canWriteCsf: guard.canWriteCsf,
      canReadAudit: guard.canReadAudit,
      canReadReadiness: guard.canReadReadiness,
      canExposePerformance: guard.canExposePerformance,
      canExposeSuccession: guard.canExposeSuccession,
      visibleEmployeeIds,
      lmsEnabled: true,
      searchParams: parseHrCsfSearchParams(resolvedSearchParams),
    }),
  };
}

export async function renderHrCsfHubPage(searchParams?: HrSearchParamsInput) {
  try {
    const { modelInput } = await resolveHrCsfPageModelInput(searchParams);
    const pageModel = await buildHrCsfHubPageModel(modelInput);
    return React.createElement(HrCsfHubSection, { pageModel });
  } catch (error) {
    if (isHrCsfAccessFailure(error)) {
      return React.createElement(HrCsfAccessDeniedPanel);
    }
    throw error;
  }
}

export async function renderHrCsfReportsPage(searchParams?: HrSearchParamsInput) {
  const { modelInput } = await resolveHrCsfPageModelInput(searchParams);
  const pageModel = await buildHrCsfReportsPageModel(modelInput);
  return React.createElement(HrCsfReportsSection, { pageModel });
}

export async function renderHrCsfAuditPage(searchParams?: HrSearchParamsInput) {
  const { guard, modelInput } = await resolveHrCsfPageModelInput(searchParams);
  if (!guard.canReadAudit) {
    return React.createElement(HrCsfAccessDeniedPanel);
  }
  const pageModel = await buildHrCsfAuditPageModel(modelInput);
  if (!pageModel) {
    return React.createElement(HrCsfAccessDeniedPanel);
  }
  return React.createElement(HrCsfAuditSection, { pageModel });
}

export async function renderHrCsfMatchingPage(searchParams?: HrSearchParamsInput) {
  const { modelInput } = await resolveHrCsfPageModelInput(searchParams);
  const pageModel = await buildHrCsfMatchingPageModel(modelInput);
  return React.createElement(HrCsfMatchingSection, { pageModel });
}
