import React from "react";
import {
  ExecutionAccessDeniedError,
  ExecutionContextRequiredError,
} from "@afenda/kernel/execution";

import {
  parseHrPerformanceAppraisalsSearchParams,
  toHrPerformanceAppraisalsPageModelInput,
} from "./data/hr.talent.performance-search-params.parse.shared";

type HrRawSearchParams = Record<string, string | string[] | undefined> | undefined;
type HrSearchParamsInput = HrRawSearchParams | Promise<HrRawSearchParams>;

export * from "./actions";
export * from "./data";
export * from "./events";
export * from "./policies";
export * from "./schemas";
export * from "./contracts";

export {
  buildHrPerformanceAppraisalsPageModel,
  type HrPerformanceAppraisalsPageModel,
} from "./data/hr.talent.performance.page-model.server";

export {
  HrPerformanceAppraisalsAccessDeniedPanel,
  HrPerformanceAppraisalsSection,
} from "./components";

import { buildHrPerformanceAppraisalsPageModel } from "./data/hr.talent.performance.page-model.server";
import { requireHrPerformanceRead } from "./policies/hr.talent.performance-access.policy.server";
import {
  HrPerformanceAppraisalsAccessDeniedPanel,
  HrPerformanceAppraisalsSection,
} from "./components";

function isHrPerformanceAccessFailure(error: unknown) {
  return (
    error instanceof ExecutionContextRequiredError ||
    error instanceof ExecutionAccessDeniedError
  );
}

export async function buildHrPerformanceAppraisalsPageModelForRequest(
  searchParams?: HrSearchParamsInput,
) {
  const [guard, resolvedSearchParams] = await Promise.all([
    requireHrPerformanceRead(),
    searchParams ?? Promise.resolve(undefined),
  ]);
  const visibleEmployeeIds = await guard.resolveVisibleEmployeeIds({
    scope: guard.canWritePerformance ? "org" : "team",
  });

  return buildHrPerformanceAppraisalsPageModel(
    toHrPerformanceAppraisalsPageModelInput({
      organizationId: guard.organization.id,
      visibleEmployeeIds,
      canWritePerformance: guard.canWritePerformance,
      canReadAudit: guard.canReadAudit,
      canReadCompensationOutcome: guard.canReadCompensationOutcome,
      searchParams: parseHrPerformanceAppraisalsSearchParams(resolvedSearchParams),
    }),
  );
}

export async function renderHrPerformanceAppraisalsPage(
  searchParams?: HrSearchParamsInput,
) {
  try {
    const pageModel =
      await buildHrPerformanceAppraisalsPageModelForRequest(searchParams);
    return React.createElement(HrPerformanceAppraisalsSection, { pageModel });
  } catch (error) {
    if (isHrPerformanceAccessFailure(error)) {
      return React.createElement(HrPerformanceAppraisalsAccessDeniedPanel);
    }
    throw error;
  }
}
