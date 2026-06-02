import React from "react";
import {
  ExecutionAccessDeniedError,
  ExecutionContextRequiredError,
} from "@afenda/kernel/execution";

import {
  parseHrIndustryMscSearchParams,
  toHrIndustryMscPageModelInput,
} from "./data/hr.industry.msc-search-params.parse.shared";

type HrRawSearchParams = Record<string, string | string[] | undefined> | undefined;
type HrSearchParamsInput = HrRawSearchParams | Promise<HrRawSearchParams>;

export * from "./actions";
export * from "./contracts";
export * from "./data";
export * from "./events";
export * from "./policies";
export * from "./schemas";

export {
  buildHrIndustryMscPageModel,
  type HrIndustryMscPageModel,
} from "./data/hr.industry.msc.page-model.server";

export {
  HrIndustryMscAccessDeniedPanel,
  HrIndustryMscSection,
} from "./components";

import { buildHrIndustryMscPageModel } from "./data/hr.industry.msc.page-model.server";
import { requireHrIndustryMscRead } from "./policies/hr.industry.msc-access.policy.server";
import {
  HrIndustryMscAccessDeniedPanel,
  HrIndustryMscSection,
} from "./components";

function isHrIndustryMscAccessFailure(error: unknown) {
  return (
    error instanceof ExecutionContextRequiredError ||
    error instanceof ExecutionAccessDeniedError
  );
}

export async function buildHrIndustryMscPageModelForRequest(
  searchParams?: HrSearchParamsInput,
) {
  const [guard, resolvedSearchParams] = await Promise.all([
    requireHrIndustryMscRead(),
    searchParams ?? Promise.resolve(undefined),
  ]);
  const visibleEmployeeIds = await guard.resolveVisibleEmployeeIds({
    scope: guard.canWrite || guard.canApprove ? "org" : "team",
  });

  return buildHrIndustryMscPageModel(
    toHrIndustryMscPageModelInput({
      organizationId: guard.organization.id,
      visibleEmployeeIds,
      canWrite: guard.canWrite,
      canApprove: guard.canApprove,
      canReadAudit: guard.canReadAudit,
      canReadRestricted: guard.canReadRestricted,
      canExposeIntegrations: guard.canExposeIntegrations,
      searchParams: parseHrIndustryMscSearchParams(resolvedSearchParams),
    }),
  );
}

export async function renderHrIndustryMscPage(searchParams?: HrSearchParamsInput) {
  try {
    const pageModel = await buildHrIndustryMscPageModelForRequest(searchParams);
    return React.createElement(HrIndustryMscSection, { pageModel });
  } catch (error) {
    if (isHrIndustryMscAccessFailure(error)) {
      return React.createElement(HrIndustryMscAccessDeniedPanel);
    }
    throw error;
  }
}
