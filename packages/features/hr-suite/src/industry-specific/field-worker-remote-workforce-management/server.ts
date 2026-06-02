import React from "react";
import {
  ExecutionAccessDeniedError,
  ExecutionContextRequiredError,
} from "@afenda/kernel/execution";

import {
  parseHrIndustryFrmSearchParams,
  toHrIndustryFrmPageModelInput,
} from "./data/hr.industry.frm-search-params.parse.shared";

type HrRawSearchParams = Record<string, string | string[] | undefined> | undefined;
type HrSearchParamsInput = HrRawSearchParams | Promise<HrRawSearchParams>;

export * from "./actions";
export * from "./contracts";
export * from "./data";
export * from "./events";
export * from "./policies";
export * from "./schemas";

export {
  buildHrIndustryFrmPageModel,
  type HrIndustryFrmPageModel,
} from "./data/hr.industry.frm.page-model.server";

export {
  HrIndustryFrmAccessDeniedPanel,
  HrIndustryFrmSection,
} from "./components";

import { buildHrIndustryFrmPageModel } from "./data/hr.industry.frm.page-model.server";
import { requireHrIndustryFrmRead } from "./policies/hr.industry.frm-access.policy.server";
import {
  HrIndustryFrmAccessDeniedPanel,
  HrIndustryFrmSection,
} from "./components";

function isHrIndustryFrmAccessFailure(error: unknown) {
  return (
    error instanceof ExecutionContextRequiredError ||
    error instanceof ExecutionAccessDeniedError
  );
}

export async function buildHrIndustryFrmPageModelForRequest(
  searchParams?: HrSearchParamsInput,
) {
  const [guard, resolvedSearchParams] = await Promise.all([
    requireHrIndustryFrmRead(),
    searchParams ?? Promise.resolve(undefined),
  ]);
  const visibleEmployeeIds = await guard.resolveVisibleEmployeeIds({
    scope: guard.canWrite || guard.canApprove ? "org" : "team",
  });

  return buildHrIndustryFrmPageModel(
    toHrIndustryFrmPageModelInput({
      organizationId: guard.organization.id,
      visibleEmployeeIds,
      canWrite: guard.canWrite,
      canApprove: guard.canApprove,
      canReadAudit: guard.canReadAudit,
      canReadRestricted: guard.canReadRestricted,
      canExposeIntegrations: guard.canExposeIntegrations,
      searchParams: parseHrIndustryFrmSearchParams(resolvedSearchParams),
    }),
  );
}

export async function renderHrIndustryFrmPage(searchParams?: HrSearchParamsInput) {
  try {
    const pageModel = await buildHrIndustryFrmPageModelForRequest(searchParams);
    return React.createElement(HrIndustryFrmSection, { pageModel });
  } catch (error) {
    if (isHrIndustryFrmAccessFailure(error)) {
      return React.createElement(HrIndustryFrmAccessDeniedPanel);
    }
    throw error;
  }
}
