import React from "react";
import {
  ExecutionAccessDeniedError,
  ExecutionContextRequiredError,
} from "@afenda/kernel/execution";

import {
  parseHrIndustryUcbSearchParams,
  toHrIndustryUcbPageModelInput,
} from "./data/hr.industry.ucb-search-params.parse.shared";

type HrRawSearchParams = Record<string, string | string[] | undefined> | undefined;
type HrSearchParamsInput = HrRawSearchParams | Promise<HrRawSearchParams>;

export * from "./actions";
export * from "./contracts";
export * from "./data";
export * from "./events";
export * from "./policies";
export * from "./schemas";

export {
  buildHrIndustryUcbPageModel,
  type HrIndustryUcbPageModel,
} from "./data/hr.industry.ucb.page-model.server";

export {
  HrIndustryUcbAccessDeniedPanel,
  HrIndustryUcbSection,
} from "./components";

import { buildHrIndustryUcbPageModel } from "./data/hr.industry.ucb.page-model.server";
import { requireHrIndustryUcbRead } from "./policies/hr.industry.ucb-access.policy.server";
import {
  HrIndustryUcbAccessDeniedPanel,
  HrIndustryUcbSection,
} from "./components";

function isHrIndustryUcbAccessFailure(error: unknown) {
  return (
    error instanceof ExecutionContextRequiredError ||
    error instanceof ExecutionAccessDeniedError
  );
}

export async function buildHrIndustryUcbPageModelForRequest(
  searchParams?: HrSearchParamsInput,
) {
  const [guard, resolvedSearchParams] = await Promise.all([
    requireHrIndustryUcbRead(),
    searchParams ?? Promise.resolve(undefined),
  ]);
  const visibleEmployeeIds = await guard.resolveVisibleEmployeeIds({
    scope: guard.canWrite || guard.canApprove ? "org" : "team",
  });

  return buildHrIndustryUcbPageModel(
    toHrIndustryUcbPageModelInput({
      organizationId: guard.organization.id,
      visibleEmployeeIds,
      canWrite: guard.canWrite,
      canApprove: guard.canApprove,
      canReadAudit: guard.canReadAudit,
      canReadRestricted: guard.canReadRestricted,
      canManageGrievances: guard.canManageGrievances,
      canReadLegalReferences: guard.canReadLegalReferences,
      canExposePayroll: guard.canExposePayroll,
      canExposeIntegrations: guard.canExposeIntegrations,
      canExportReports: guard.canExportReports,
      searchParams: parseHrIndustryUcbSearchParams(resolvedSearchParams),
    }),
  );
}

export async function renderHrIndustryUcbPage(searchParams?: HrSearchParamsInput) {
  try {
    const pageModel = await buildHrIndustryUcbPageModelForRequest(searchParams);
    return React.createElement(HrIndustryUcbSection, { pageModel });
  } catch (error) {
    if (isHrIndustryUcbAccessFailure(error)) {
      return React.createElement(HrIndustryUcbAccessDeniedPanel);
    }
    throw error;
  }
}
