import React from "react";
import {
  ExecutionAccessDeniedError,
  ExecutionContextRequiredError,
} from "@afenda/kernel/execution";

import {
  parseHrTalentEngSearchParams,
  toHrTalentEngPageModelInput,
} from "./data/hr.talent.eng-search-params.parse.shared";

type HrRawSearchParams = Record<string, string | string[] | undefined> | undefined;
type HrSearchParamsInput = HrRawSearchParams | Promise<HrRawSearchParams>;

export * from "./actions";
export * from "./contracts";
export * from "./data";
export * from "./events";
export * from "./policies";
export * from "./schemas";

export {
  buildHrTalentEngPageModel,
  type HrTalentEngPageModel,
} from "./data/hr.talent.eng.page-model.server";

export {
  HrTalentEngAccessDeniedPanel,
  HrTalentEngSection,
} from "./components";

import { buildHrTalentEngPageModel } from "./data/hr.talent.eng.page-model.server";
import { requireHrTalentEngRead } from "./policies/hr.talent.eng-access.policy.server";
import {
  HrTalentEngAccessDeniedPanel,
  HrTalentEngSection,
} from "./components";

function isHrTalentEngAccessFailure(error: unknown) {
  return (
    error instanceof ExecutionContextRequiredError ||
    error instanceof ExecutionAccessDeniedError
  );
}

export async function buildHrTalentEngPageModelForRequest(
  searchParams?: HrSearchParamsInput,
) {
  const [guard, resolvedSearchParams] = await Promise.all([
    requireHrTalentEngRead(),
    searchParams ?? Promise.resolve(undefined),
  ]);
  const visibleEmployeeIds = await guard.resolveVisibleEmployeeIds();

  return buildHrTalentEngPageModel(
    toHrTalentEngPageModelInput({
      organizationId: guard.organization.id,
      actorUserId: guard.session.id,
      visibleEmployeeIds,
      canWrite: guard.canWrite,
      canApprove: guard.canApprove,
      canReadAudit: guard.canReadAudit,
      canReadRestricted: guard.canReadRestricted,
      canExposeIntegrations: guard.canExposeIntegrations,
      searchParams: parseHrTalentEngSearchParams(resolvedSearchParams),
    }),
  );
}

export async function renderHrTalentEngPage(searchParams?: HrSearchParamsInput) {
  try {
    const pageModel = await buildHrTalentEngPageModelForRequest(searchParams);
    return React.createElement(HrTalentEngSection, { pageModel });
  } catch (error) {
    if (isHrTalentEngAccessFailure(error)) {
      return React.createElement(HrTalentEngAccessDeniedPanel);
    }
    throw error;
  }
}
