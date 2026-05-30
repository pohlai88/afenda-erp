import React from "react";

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

export function HrFwaAccessDenied() {
  return React.createElement(HrFwaAccessDeniedPanel);
}
