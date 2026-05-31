import React from "react";

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

export function HrGeoAccessDenied() {
  return React.createElement(HrGeoAccessDeniedPanel);
}
