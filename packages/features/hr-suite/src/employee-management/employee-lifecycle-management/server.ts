import React from "react";

import { SectionPanel } from "@afenda/ui";

import {
  HrLifecycleAccessDeniedPanel,
  HrLifecycleWorkbenchSection,
} from "./components/hr.workforce.lifecycle-section.component.server";

/**
 * Server door — employee-management/employee-lifecycle-management
 */
export * from "./actions";
export * from "./data";
export * from "./events";
export * from "./policies";
export * from "./schemas";
export {
  hrWorkforceLifecycleReadPermission,
  hrWorkforceLifecycleWritePermission,
} from "./contracts/hr.workforce.lifecycle.contract";
export {
  hrLifecycleRoutePaths,
  type HrLifecycleRoutePath,
} from "./contracts/hr.workforce.lifecycle-route.contract";

export { HrLifecycleAccessDeniedPanel, HrLifecycleWorkbenchSection };

export function HrLifecycleAccessDenied() {
  return React.createElement(HrLifecycleAccessDeniedPanel);
}

export function HrLifecycleSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return React.createElement(
    SectionPanel,
    { headingLevel: 2, title, description },
    children,
  );
}
