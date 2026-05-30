import React from "react";

import { SectionPanel } from "@afenda/ui";

import {
  HrOffboardingAccessDeniedPanel,
  HrOffboardingWorkbenchSection,
} from "./components/hr.workforce.offboarding-section.component.server";

export * from "./actions";
export * from "./data";
export * from "./policies";
export * from "./schemas";
export * from "./contracts";

export { HrOffboardingAccessDeniedPanel, HrOffboardingWorkbenchSection };

export function HrOffboardingAccessDenied() {
  return React.createElement(HrOffboardingAccessDeniedPanel);
}

export function HrOffboardingSection({
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
