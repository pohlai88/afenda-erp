import React from "react";
import {
  ExecutionAccessDeniedError,
  ExecutionContextRequiredError,
} from "@afenda/kernel/execution";

import {
  parseHrIndustryFhcSearchParams,
  toHrIndustryFhcPageModelInput,
} from "./data/hr.industry.fhc-search-params.parse.shared";

type HrRawSearchParams = Record<string, string | string[] | undefined> | undefined;
type HrSearchParamsInput = HrRawSearchParams | Promise<HrRawSearchParams>;

export * from "./actions";
export * from "./contracts";
export * from "./data";
export * from "./events";
export * from "./policies";
export * from "./schemas";

export {
  buildHrIndustryFhcPageModel,
  type HrIndustryFhcPageModel,
} from "./data/hr.industry.fhc.page-model.server";

export {
  HrIndustryFhcAccessDeniedPanel,
  HrIndustryFhcSection,
} from "./components";

import { buildHrIndustryFhcPageModel } from "./data/hr.industry.fhc.page-model.server";
import { requireHrIndustryFhcRead } from "./policies/hr.industry.fhc-access.policy.server";
import {
  HrIndustryFhcAccessDeniedPanel,
  HrIndustryFhcSection,
} from "./components";

function isHrIndustryFhcAccessFailure(error: unknown) {
  return (
    error instanceof ExecutionContextRequiredError ||
    error instanceof ExecutionAccessDeniedError
  );
}

export async function buildHrIndustryFhcPageModelForRequest(
  searchParams?: HrSearchParamsInput,
) {
  const [guard, resolvedSearchParams] = await Promise.all([
    requireHrIndustryFhcRead(),
    searchParams ?? Promise.resolve(undefined),
  ]);
  const visibleEmployeeIds = await guard.resolveVisibleEmployeeIds({
    scope: guard.canWrite || guard.canApprove ? "org" : "team",
  });

  return buildHrIndustryFhcPageModel(
    toHrIndustryFhcPageModelInput({
      organizationId: guard.organization.id,
      visibleEmployeeIds,
      canWrite: guard.canWrite,
      canApprove: guard.canApprove,
      canReadAudit: guard.canReadAudit,
      canReadRestricted: guard.canReadRestricted,
      canExposeIntegrations: guard.canExposeIntegrations,
      searchParams: parseHrIndustryFhcSearchParams(resolvedSearchParams),
    }),
  );
}

export async function renderHrIndustryFhcPage(searchParams?: HrSearchParamsInput) {
  try {
    const pageModel = await buildHrIndustryFhcPageModelForRequest(searchParams);
    return React.createElement(HrIndustryFhcSection, { pageModel });
  } catch (error) {
    if (isHrIndustryFhcAccessFailure(error)) {
      return React.createElement(HrIndustryFhcAccessDeniedPanel);
    }
    throw error;
  }
}
