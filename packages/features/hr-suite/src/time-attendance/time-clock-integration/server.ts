import React from "react";

import {
  buildHrTimeClockPageModel,
} from "./data/hr.time.clock-integration.page-model.server";
import { toHrTimeClockPageModelInput } from "./data/hr.time.clock-integration-search-params.parse.shared";
import { requireHrTimeClockRead } from "./policies/hr.time.clock-integration-access.policy.server";

export * from "./actions/hr.time.clock-integration.actions.server";
export * from "./actions/hr.time.clock-integration.api-ingest.actions.server";
export * from "./data/hr.time.clock-integration-devices.shared.server";
export * from "./data/hr.time.clock-integration.page-model.server";
export * from "./data/hr.time.clock-integration-search-params.parse.shared";
export * from "./data/hr.time.clock-integration-list-load.shared";
export * from "./data/hr.time.clock-integration-lam-export.shared.server";
export * from "./data/hr.time.clock-integration-overtime-refs.shared.server";
export * from "./data/hr.time.clock-integration-payroll-refs.shared.server";
export * from "./data/hr.time.clock-integration-sync-alerts.shared.server";
export * from "./data/hr.time.clock-integration-sync.shared.server";
export * from "./data/hr.time.clock-integration-reports.shared";
export * from "./schemas";
export * from "./contracts";
export * from "./events";
export * from "./policies";

export {
  HrTimeClockAccessDeniedPanel,
  HrTimeClockWorkbenchSection,
} from "./components/hr.time.clock-integration-section.component.server";

import { HrTimeClockAccessDeniedPanel } from "./components/hr.time.clock-integration-section.component.server";
import { HrTimeClockWorkbenchSection } from "./components/hr.time.clock-integration-section.component.server";

export function HrTimeClockAccessDenied() {
  return React.createElement(HrTimeClockAccessDeniedPanel);
}

type HrRawSearchParams = Record<string, string | string[] | undefined> | undefined;
type HrSearchParamsInput = HrRawSearchParams | Promise<HrRawSearchParams>;

export async function renderHrTimeClockPage(searchParams?: HrSearchParamsInput) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  try {
    const guard = await requireHrTimeClockRead();
    const model = await buildHrTimeClockPageModel(
      toHrTimeClockPageModelInput({
        organizationId: guard.organization.id,
        canWrite: guard.canWrite,
        canAdmin: guard.canAdmin,
        canReadAudit: true,
        searchParams: resolvedSearchParams,
      }),
    );

    return React.createElement(HrTimeClockWorkbenchSection, { model });
  } catch {
    return React.createElement(HrTimeClockAccessDeniedPanel);
  }
}
