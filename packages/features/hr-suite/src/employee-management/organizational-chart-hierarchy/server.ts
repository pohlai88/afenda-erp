import React from "react";

import { SectionPanel } from "@afenda/ui";

import {
  HrOrgAccessDeniedPanel,
  HrOrgWorkbenchSection,
} from "./components/hr.workforce.org-section.component.server";

export * from "./actions";
export * from "./data";
export * from "./policies";
export * from "./schemas";
export * from "./contracts";
export * from "./events";

export { HrOrgAccessDeniedPanel, HrOrgWorkbenchSection };

export function HrOrgAccessDenied() {
  return React.createElement(HrOrgAccessDeniedPanel);
}

export function HrOrgSection({
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
