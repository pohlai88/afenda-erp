import React from "react";
import {
  ExecutionAccessDeniedError,
  ExecutionContextRequiredError,
} from "@afenda/kernel/execution";

import {
  parseHrWorkforceEssSearchParams,
  toHrWorkforceEssPageModelInput,
} from "./data/hr.workforce.ess-search-params.parse.shared";

type HrRawSearchParams = Record<string, string | string[] | undefined> | undefined;
type HrSearchParamsInput = HrRawSearchParams | Promise<HrRawSearchParams>;

export * from "./actions";
export * from "./contracts";
export * from "./data";
export * from "./events";
export * from "./policies";
export * from "./schemas";

export {
  buildHrWorkforceEssPageModel,
  type HrWorkforceEssPageModel,
} from "./data/hr.workforce.ess.page-model.server";

export {
  HrWorkforceEssAccessDeniedPanel,
  HrWorkforceEssSection,
} from "./components";

import { buildHrWorkforceEssPageModel } from "./data/hr.workforce.ess.page-model.server";
import { requireHrWorkforceEssRead } from "./policies/hr.workforce.ess-access.policy.server";
import {
  HrWorkforceEssAccessDeniedPanel,
  HrWorkforceEssSection,
} from "./components";

function isHrWorkforceEssAccessFailure(error: unknown) {
  return (
    error instanceof ExecutionContextRequiredError ||
    error instanceof ExecutionAccessDeniedError
  );
}

export async function buildHrWorkforceEssPageModelForRequest(
  searchParams?: HrSearchParamsInput,
) {
  const [guard, resolvedSearchParams] = await Promise.all([
    requireHrWorkforceEssRead(),
    searchParams ?? Promise.resolve(undefined),
  ]);
  const visibleEmployeeIds = await guard.resolveVisibleEmployeeIds();

  return buildHrWorkforceEssPageModel(
    toHrWorkforceEssPageModelInput({
      organizationId: guard.organization.id,
      actorUserId: guard.session.id,
      visibleEmployeeIds,
      canWrite: guard.canWrite,
      canApprove: guard.canApprove,
      canReadAudit: guard.canReadAudit,
      canReadRestricted: guard.canReadRestricted,
      canExposeIntegrations: guard.canExposeIntegrations,
      searchParams: parseHrWorkforceEssSearchParams(resolvedSearchParams),
    }),
  );
}

export async function renderHrWorkforceEssPage(searchParams?: HrSearchParamsInput) {
  try {
    const pageModel = await buildHrWorkforceEssPageModelForRequest(searchParams);
    return React.createElement(HrWorkforceEssSection, { pageModel });
  } catch (error) {
    if (isHrWorkforceEssAccessFailure(error)) {
      return React.createElement(HrWorkforceEssAccessDeniedPanel);
    }
    throw error;
  }
}
