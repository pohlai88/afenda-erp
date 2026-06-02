import React from "react";
import {
  ExecutionAccessDeniedError,
  ExecutionContextRequiredError,
} from "@afenda/kernel/execution";

import {
  parseHrIndustryGpgSearchParams,
  toHrIndustryGpgPageModelInput,
} from "./data/hr.industry.gpg-search-params.parse.shared";

type HrRawSearchParams = Record<string, string | string[] | undefined> | undefined;
type HrSearchParamsInput = HrRawSearchParams | Promise<HrRawSearchParams>;

export * from "./actions";
export * from "./contracts";
export * from "./data";
export * from "./events";
export * from "./policies";
export * from "./schemas";

export {
  buildHrIndustryGpgPageModel,
  type HrIndustryGpgPageModel,
} from "./data/hr.industry.gpg.page-model.server";

export {
  HrIndustryGpgAccessDeniedPanel,
  HrIndustryGpgSection,
} from "./components";

import { buildHrIndustryGpgPageModel } from "./data/hr.industry.gpg.page-model.server";
import { requireHrIndustryGpgRead } from "./policies/hr.industry.gpg-access.policy.server";
import {
  HrIndustryGpgAccessDeniedPanel,
  HrIndustryGpgSection,
} from "./components";

function isHrIndustryGpgAccessFailure(error: unknown) {
  return (
    error instanceof ExecutionContextRequiredError ||
    error instanceof ExecutionAccessDeniedError
  );
}

export async function buildHrIndustryGpgPageModelForRequest(
  searchParams?: HrSearchParamsInput,
) {
  const [guard, resolvedSearchParams] = await Promise.all([
    requireHrIndustryGpgRead(),
    searchParams ?? Promise.resolve(undefined),
  ]);
  const visibleEmployeeIds = await guard.resolveVisibleEmployeeIds({
    scope: guard.canWrite || guard.canApprove ? "org" : "team",
  });

  return buildHrIndustryGpgPageModel(
    toHrIndustryGpgPageModelInput({
      organizationId: guard.organization.id,
      visibleEmployeeIds,
      canWrite: guard.canWrite,
      canApprove: guard.canApprove,
      canReadAudit: guard.canReadAudit,
      canReadRestricted: guard.canReadRestricted,
      canExposeIntegrations: guard.canExposeIntegrations,
      searchParams: parseHrIndustryGpgSearchParams(resolvedSearchParams),
    }),
  );
}

export async function renderHrIndustryGpgPage(searchParams?: HrSearchParamsInput) {
  try {
    const pageModel = await buildHrIndustryGpgPageModelForRequest(searchParams);
    return React.createElement(HrIndustryGpgSection, { pageModel });
  } catch (error) {
    if (isHrIndustryGpgAccessFailure(error)) {
      return React.createElement(HrIndustryGpgAccessDeniedPanel);
    }
    throw error;
  }
}
