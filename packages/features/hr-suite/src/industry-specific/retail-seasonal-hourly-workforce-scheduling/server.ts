import React from "react";
import {
  ExecutionAccessDeniedError,
  ExecutionContextRequiredError,
} from "@afenda/kernel/execution";

import {
  parseHrIndustryRwsSearchParams,
  toHrIndustryRwsPageModelInput,
} from "./data/hr.industry.rws-search-params.parse.shared";

type HrRawSearchParams = Record<string, string | string[] | undefined> | undefined;
type HrSearchParamsInput = HrRawSearchParams | Promise<HrRawSearchParams>;

export * from "./actions";
export * from "./contracts";
export * from "./data";
export * from "./events";
export * from "./policies";
export * from "./schemas";

export {
  buildHrIndustryRwsPageModel,
  type HrIndustryRwsPageModel,
} from "./data/hr.industry.rws.page-model.server";

export {
  HrIndustryRwsAccessDeniedPanel,
  HrIndustryRwsSection,
} from "./components";

import { buildHrIndustryRwsPageModel } from "./data/hr.industry.rws.page-model.server";
import { requireHrIndustryRwsRead } from "./policies/hr.industry.rws-access.policy.server";
import {
  HrIndustryRwsAccessDeniedPanel,
  HrIndustryRwsSection,
} from "./components";

function isHrIndustryRwsAccessFailure(error: unknown) {
  return (
    error instanceof ExecutionContextRequiredError ||
    error instanceof ExecutionAccessDeniedError
  );
}

export async function buildHrIndustryRwsPageModelForRequest(
  searchParams?: HrSearchParamsInput,
) {
  const [guard, resolvedSearchParams] = await Promise.all([
    requireHrIndustryRwsRead(),
    searchParams ?? Promise.resolve(undefined),
  ]);
  const visibleEmployeeIds = await guard.resolveVisibleEmployeeIds({
    scope: guard.canWrite || guard.canApprove ? "org" : "team",
  });

  return buildHrIndustryRwsPageModel(
    toHrIndustryRwsPageModelInput({
      organizationId: guard.organization.id,
      visibleEmployeeIds,
      canWrite: guard.canWrite,
      canApprove: guard.canApprove,
      canReadAudit: guard.canReadAudit,
      canReadRestricted: guard.canReadRestricted,
      canReadLaborCost: guard.canReadLaborCost,
      canExposeIntegrations: guard.canExposeIntegrations,
      searchParams: parseHrIndustryRwsSearchParams(resolvedSearchParams),
    }),
  );
}

export async function renderHrIndustryRwsPage(searchParams?: HrSearchParamsInput) {
  try {
    const pageModel = await buildHrIndustryRwsPageModelForRequest(searchParams);
    return React.createElement(HrIndustryRwsSection, { pageModel });
  } catch (error) {
    if (isHrIndustryRwsAccessFailure(error)) {
      return React.createElement(HrIndustryRwsAccessDeniedPanel);
    }
    throw error;
  }
}
