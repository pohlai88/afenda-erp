import React from "react";
import {
  ExecutionAccessDeniedError,
  ExecutionContextRequiredError,
} from "@afenda/kernel/execution";

import {
  parseHrTrainingSearchParams,
  toHrTrainingPageModelInput,
} from "./data/hr.talent.training-search-params.parse.shared";

type HrRawSearchParams = Record<string, string | string[] | undefined> | undefined;
type HrSearchParamsInput = HrRawSearchParams | Promise<HrRawSearchParams>;

export * from "./actions";
export * from "./contracts";
export * from "./data";
export * from "./events";
export * from "./policies";
export * from "./schemas";

export {
  buildHrTrainingPageModel,
  buildHrTalentTrainingPageModel,
  type HrTrainingPageModel,
  type HrTalentTrainingPageModel,
} from "./data/hr.talent.training.page-model.server";

export {
  HrTrainingAccessDeniedPanel,
  HrTrainingSection,
  HrTalentTrainingAccessDeniedPanel,
  HrTalentTrainingSection,
} from "./components";

import { buildHrTrainingPageModel } from "./data/hr.talent.training.page-model.server";
import { requireHrTrainingRead } from "./policies/hr.talent.training-access.policy.server";
import {
  HrTrainingAccessDeniedPanel,
  HrTrainingSection,
} from "./components";

function isHrTrainingAccessFailure(error: unknown) {
  return (
    error instanceof ExecutionContextRequiredError ||
    error instanceof ExecutionAccessDeniedError
  );
}

export async function buildHrTrainingPageModelForRequest(
  searchParams?: HrSearchParamsInput,
) {
  const [guard, resolvedSearchParams] = await Promise.all([
    requireHrTrainingRead(),
    searchParams ?? Promise.resolve(undefined),
  ]);
  const visibleEmployeeIds = await guard.resolveVisibleEmployeeIds({
    scope: guard.canWrite || guard.canApprove ? "org" : "team",
  });

  return buildHrTrainingPageModel(
    toHrTrainingPageModelInput({
      organizationId: guard.organization.id,
      visibleEmployeeIds,
      canWrite: guard.canWrite,
      canApprove: guard.canApprove,
      canReadAudit: guard.canReadAudit,
      canReadRestricted: guard.canReadRestricted,
      canExposeIntegrations: guard.canExposeIntegrations,
      searchParams: parseHrTrainingSearchParams(resolvedSearchParams),
    }),
  );
}

export async function renderHrTrainingPage(searchParams?: HrSearchParamsInput) {
  try {
    const pageModel = await buildHrTrainingPageModelForRequest(searchParams);
    return React.createElement(HrTrainingSection, { pageModel });
  } catch (error) {
    if (isHrTrainingAccessFailure(error)) {
      return React.createElement(HrTrainingAccessDeniedPanel);
    }
    throw error;
  }
}
