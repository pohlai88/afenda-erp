import React from "react";

import { SectionPanel } from "@afenda/ui";

import {
  HrComplianceAccessDeniedPanel,
  HrComplianceWorkbenchSection,
} from "./components/hr.workforce.compliance-section.component.server";

/**
 * Server door — employee-management/compliance-regulatory-tracking
 */
export * from "./actions";
export * from "./data";
export * from "./events";
export * from "./policies";
export * from "./schemas";
export * from "./contracts";

export { HrComplianceAccessDeniedPanel, HrComplianceWorkbenchSection };

export function HrComplianceAccessDenied() {
  return React.createElement(HrComplianceAccessDeniedPanel);
}

export function HrComplianceSection({
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
