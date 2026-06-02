import React from "react";
import {
  ExecutionAccessDeniedError,
  ExecutionContextRequiredError,
} from "@afenda/kernel/execution";

import {
  buildHrGeoPageModel,
} from "./data/hr.time.geo.page-model.server";
import { toHrGeoPageModelInput } from "./data/hr.time.geo-search-params.parse.shared";
import { requireHrGeoRead } from "./policies/hr.time.geo-access.policy.server";

export * from "./actions";
export * from "./data";
export * from "./schemas";
export * from "./contracts";
export * from "./events";
export * from "./policies";
export * from "./data/geolocation-acceptance-coverage.shared";

export {
  HrGeoAccessDeniedPanel,
  HrGeoWorkbenchSection,
} from "./components/hr.time.geo-section.component.server";

import { HrGeoAccessDeniedPanel } from "./components/hr.time.geo-section.component.server";
import { HrGeoWorkbenchSection } from "./components/hr.time.geo-section.component.server";

export function HrGeoAccessDenied() {
  return React.createElement(HrGeoAccessDeniedPanel);
}

type HrRawSearchParams = Record<string, string | string[] | undefined> | undefined;
type HrSearchParamsInput = HrRawSearchParams | Promise<HrRawSearchParams>;

function isHrGeoAccessFailure(error: unknown) {
  return (
    error instanceof ExecutionContextRequiredError ||
    error instanceof ExecutionAccessDeniedError
  );
}

export async function buildHrGeoPageModelForRequest(
  searchParams?: HrSearchParamsInput,
) {
  const [guard, resolvedSearchParams] = await Promise.all([
    requireHrGeoRead(),
    searchParams ?? Promise.resolve(undefined),
  ]);

  const visibleEmployeeIds = await guard.resolveVisibleEmployeeIds({
    scope: guard.canWriteGeo ? "org" : "team",
  });

  return buildHrGeoPageModel(
    toHrGeoPageModelInput({
      organizationId: guard.organization.id,
      canWriteGeo: guard.canWriteGeo,
      canViewDetailedLocation: guard.canViewDetailedLocation,
      canReadAudit: guard.canReadAudit,
      visibleEmployeeIds,
      searchParams: resolvedSearchParams,
    }),
  );
}

export async function renderHrGeoPage(searchParams?: HrSearchParamsInput) {
  try {
    const pageModel = await buildHrGeoPageModelForRequest(searchParams);
    return React.createElement(HrGeoWorkbenchSection, { model: pageModel });
  } catch (error) {
    if (isHrGeoAccessFailure(error)) {
      return React.createElement(HrGeoAccessDeniedPanel);
    }
    throw error;
  }
}
