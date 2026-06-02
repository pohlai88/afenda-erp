import React from "react";
import {
  ExecutionAccessDeniedError,
  ExecutionContextRequiredError,
} from "@afenda/kernel/execution";

import {
  parseHrTalentRssSearchParams,
  toHrTalentRssPageModelInput,
} from "./data/hr.talent.rss-search-params.parse.shared";

type HrRawSearchParams = Record<string, string | string[] | undefined> | undefined;
type HrSearchParamsInput = HrRawSearchParams | Promise<HrRawSearchParams>;

export * from "./actions";
export * from "./contracts";
export * from "./data";
export * from "./events";
export * from "./policies";
export * from "./schemas";

export {
  buildHrTalentRssPageModel,
  type HrTalentRssPageModel,
} from "./data/hr.talent.rss.page-model.server";

export {
  HrTalentRssAccessDeniedPanel,
  HrTalentRssSection,
} from "./components";

export {
  requireHrTalentRssApprove,
  requireHrTalentRssRead,
  requireHrTalentRssWrite,
} from "./policies";

import { buildHrTalentRssPageModel } from "./data/hr.talent.rss.page-model.server";
import { requireHrTalentRssRead } from "./policies";
import {
  HrTalentRssAccessDeniedPanel,
  HrTalentRssSection,
} from "./components";

function isHrTalentRssAccessFailure(error: unknown) {
  return (
    error instanceof ExecutionContextRequiredError ||
    error instanceof ExecutionAccessDeniedError
  );
}

export async function renderHrTalentRssPage(searchParams?: HrSearchParamsInput) {
  try {
    const [guard, resolvedSearchParams] = await Promise.all([
      requireHrTalentRssRead(),
      searchParams ?? Promise.resolve(undefined),
    ]);
    const visibleCandidateIds = await guard.resolveVisibleCandidateIds();
    const pageModel = await buildHrTalentRssPageModel(
      toHrTalentRssPageModelInput({
        organizationId: guard.organization.id,
        visibleCandidateIds,
        canWrite: guard.canWrite,
        canApprove: guard.canApprove,
        canReadAudit: guard.canReadAudit,
        canReadRestricted: guard.canReadRestricted,
        canExposeIntegrations: guard.canExposeIntegrations,
        searchParams: parseHrTalentRssSearchParams(resolvedSearchParams),
      }),
    );

    return React.createElement(HrTalentRssSection, { pageModel });
  } catch (error) {
    if (isHrTalentRssAccessFailure(error)) {
      return React.createElement(HrTalentRssAccessDeniedPanel);
    }
    throw error;
  }
}
