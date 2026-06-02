import React from "react";
import {
  ExecutionAccessDeniedError,
  ExecutionContextRequiredError,
} from "@afenda/kernel/execution";

import {
  parseHrRonSearchParams,
  toHrRonPageModelInput,
} from "./data/hr.talent.ron-search-params.parse.shared";

type HrRawSearchParams = Record<string, string | string[] | undefined> | undefined;
type HrSearchParamsInput = HrRawSearchParams | Promise<HrRawSearchParams>;

export * from "./actions";
export * from "./components";
export * from "./contracts";
export * from "./data";
export * from "./events";
export * from "./policies";
export * from "./schemas";

export {
  buildHrRonPageModel,
  type HrRonPageModel,
} from "./data/hr.talent.ron.page-model.server";

export {
  HrRonAccessDeniedPanel,
  HrRonSection,
} from "./components/hr.talent.ron-section.component.server";

export {
  requireHrRonApprove,
  requireHrRonOfferApprove,
  requireHrRonRead,
  requireHrRonWrite,
} from "./policies/hr.talent.ron-access.policy.server";

import { buildHrRonPageModel } from "./data/hr.talent.ron.page-model.server";
import { requireHrRonRead } from "./policies/hr.talent.ron-access.policy.server";
import {
  HrRonAccessDeniedPanel,
  HrRonSection,
} from "./components/hr.talent.ron-section.component.server";

function isHrRonAccessFailure(error: unknown) {
  return (
    error instanceof ExecutionContextRequiredError ||
    error instanceof ExecutionAccessDeniedError
  );
}

export async function renderHrRonPage(searchParams?: HrSearchParamsInput) {
  try {
    const [guard, resolvedSearchParams] = await Promise.all([
      requireHrRonRead(),
      searchParams ?? Promise.resolve(undefined),
    ]);
    const pageModel = await buildHrRonPageModel(
      toHrRonPageModelInput({
        organizationId: guard.organization.id,
        canWrite: guard.canWrite,
        canApproveRequisitions: guard.canApproveRequisitions,
        canApproveOffers: guard.canApproveOffers,
        canReadSensitiveCandidateData: guard.canReadSensitiveCandidateData,
        canReadFinance: guard.canReadFinance,
        canReadIt: guard.canReadIt,
        canReadAudit: guard.canReadAudit,
        searchParams: parseHrRonSearchParams(resolvedSearchParams),
      }),
    );

    return React.createElement(HrRonSection, { pageModel });
  } catch (error) {
    if (isHrRonAccessFailure(error)) {
      return React.createElement(HrRonAccessDeniedPanel);
    }
    throw error;
  }
}
