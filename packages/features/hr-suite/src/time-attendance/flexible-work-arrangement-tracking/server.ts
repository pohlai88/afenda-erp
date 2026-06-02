import React from "react";
import {
  ExecutionAccessDeniedError,
  ExecutionContextRequiredError,
} from "@afenda/kernel/execution";

import { buildHrFwaPageModel } from "./data/hr.time.fwa.page-model.server";
import { toHrFwaPageModelInput } from "./data/hr.time.fwa-search-params.parse.shared";
import { requireHrFwaRead } from "./policies/hr.time.fwa-access.policy.server";

export * from "./actions";
export * from "./data";
export * from "./schemas";
export * from "./policies/hr.time.fwa-routing.policy.server";
export * from "./policies/hr.time.fwa-access.policy.server";
export * from "./data/hr.time.fwa.page-model.server";
export * from "./data/hr.time.fwa-review.server";
export * from "./data/hr.time.fwa-notifications.server";
export * from "./data/hr.time.fwa-report.server";
export * from "./data/hr.time.fwa-audit-trail.server";
export * from "./data/hr.time.fwa-acceptance-coverage.shared";
export * from "./policies/hr.time.fwa-access.policy.server";
export * from "./contracts/hr.time.fwa.contract";
export * from "./events/hr.time.fwa.events";

export {
  HrFwaAccessDeniedPanel,
  HrFwaWorkbenchSection,
} from "./components/hr.time.fwa-section.component.server";

export {
  buildHrFwaArrangementsListSurface,
  hrFwaArrangementsSurfaceKey,
} from "./surface/hr.time.fwa-arrangements-list.surface";
export {
  buildHrFwaRequestsListSurface,
  hrFwaRequestsSurfaceKey,
} from "./surface/hr.time.fwa-requests-list.surface";
export {
  buildHrFwaComplianceListSurface,
  hrFwaComplianceSurfaceKey,
} from "./surface/hr.time.fwa-compliance-list.surface";

import { HrFwaAccessDeniedPanel } from "./components/hr.time.fwa-section.component.server";
import { HrFwaWorkbenchSection } from "./components/hr.time.fwa-section.component.server";

export function HrFwaAccessDenied() {
  return React.createElement(HrFwaAccessDeniedPanel);
}

type HrRawSearchParams = Record<string, string | string[] | undefined> | undefined;
type HrSearchParamsInput = HrRawSearchParams | Promise<HrRawSearchParams>;

function isHrFwaAccessFailure(error: unknown) {
  return (
    error instanceof ExecutionContextRequiredError ||
    error instanceof ExecutionAccessDeniedError
  );
}

export async function buildHrFwaPageModelForRequest(
  searchParams?: HrSearchParamsInput,
) {
  const [guard, resolvedSearchParams] = await Promise.all([
    requireHrFwaRead(),
    searchParams ?? Promise.resolve(undefined),
  ]);

  const visibleEmployeeIds = await guard.resolveVisibleEmployeeIds({
    scope: guard.canWriteFwa ? "org" : "team",
  });

  return buildHrFwaPageModel(
    toHrFwaPageModelInput({
      organizationId: guard.organization.id,
      canReadCompliance: guard.canReadCompliance,
      canReadAudit: guard.canReadAudit,
      visibleEmployeeIds,
      searchParams: resolvedSearchParams,
    }),
  );
}

export async function renderHrFwaPage(searchParams?: HrSearchParamsInput) {
  try {
    const pageModel = await buildHrFwaPageModelForRequest(searchParams);
    return React.createElement(HrFwaWorkbenchSection, { model: pageModel });
  } catch (error) {
    if (isHrFwaAccessFailure(error)) {
      return React.createElement(HrFwaAccessDeniedPanel);
    }
    throw error;
  }
}
