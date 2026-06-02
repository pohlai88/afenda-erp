import React from "react";
import {
  ExecutionAccessDeniedError,
  ExecutionContextRequiredError,
} from "@afenda/kernel/execution";

import {
  parseHrSuccessionSearchParams,
  toHrSuccessionPageModelInput,
} from "./data/hr.talent.succession-search-params.parse.shared";

type HrRawSearchParams = Record<string, string | string[] | undefined> | undefined;
type HrSearchParamsInput = HrRawSearchParams | Promise<HrRawSearchParams>;

export * from "./actions";
export * from "./data";
export * from "./events";
export * from "./policies";
export * from "./schemas";
export * from "./contracts";

export {
  buildHrSuccessionPageModel,
  buildHrSuccessionPlanningPageModel,
  type HrSuccessionPageModel,
} from "./data/hr.talent.succession.page-model.server";

export {
  HrSuccessionAccessDeniedPanel,
  HrSuccessionPlanningAccessDeniedPanel,
  HrSuccessionPlanningSection,
  HrSuccessionSection,
} from "./components";

import { buildHrSuccessionPageModel } from "./data/hr.talent.succession.page-model.server";
import { requireHrSuccessionRead } from "./policies/hr.talent.succession-access.policy.server";
import {
  HrSuccessionAccessDeniedPanel,
  HrSuccessionSection,
} from "./components";

function isHrSuccessionAccessFailure(error: unknown) {
  return (
    error instanceof ExecutionContextRequiredError ||
    error instanceof ExecutionAccessDeniedError
  );
}

export async function buildHrSuccessionPageModelForRequest(
  searchParams?: HrSearchParamsInput,
) {
  const [guard, resolvedSearchParams] = await Promise.all([
    requireHrSuccessionRead(),
    searchParams ?? Promise.resolve(undefined),
  ]);
  const visibleEmployeeIds = await guard.resolveVisibleEmployeeIds({
    scope: guard.canWrite || guard.canApprove ? "org" : "team",
  });

  return buildHrSuccessionPageModel(
    toHrSuccessionPageModelInput({
      organizationId: guard.organization.id,
      visibleEmployeeIds,
      canWrite: guard.canWrite,
      canReview: guard.canReview,
      canApprove: guard.canApprove,
      canReadAudit: guard.canReadAudit,
      canReadRestricted: guard.canReadRestricted,
      canExposeLifecycle: guard.canExposeLifecycle,
      searchParams: parseHrSuccessionSearchParams(resolvedSearchParams),
    }),
  );
}

export async function renderHrSuccessionPage(searchParams?: HrSearchParamsInput) {
  try {
    const pageModel = await buildHrSuccessionPageModelForRequest(searchParams);
    return React.createElement(HrSuccessionSection, { pageModel });
  } catch (error) {
    if (isHrSuccessionAccessFailure(error)) {
      return React.createElement(HrSuccessionAccessDeniedPanel);
    }
    throw error;
  }
}
