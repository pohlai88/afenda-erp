import React from "react";

export * from "./actions/hr.time.clock-integration.actions.server";
export * from "./data/hr.time.clock-integration-devices.shared.server";
export * from "./data/hr.time.clock-integration.page-model.server";
export * from "./data/hr.time.clock-integration-search-params.parse.shared";
export * from "./data/hr.time.clock-integration-list-load.shared";
export * from "./data/hr.time.clock-integration-lam-export.shared.server";
export * from "./data/hr.time.clock-integration-overtime-refs.shared.server";
export * from "./data/hr.time.clock-integration-payroll-refs.shared.server";
export * from "./data/hr.time.clock-integration-sync-alerts.shared.server";
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

export function HrTimeClockAccessDenied() {
  return React.createElement(HrTimeClockAccessDeniedPanel);
}
