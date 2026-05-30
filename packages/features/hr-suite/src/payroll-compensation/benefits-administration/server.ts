import React from "react";

import { SectionPanel } from "@afenda/ui";

import {
  HrBenefitsAccessDeniedPanel,
  HrBenefitsWorkbenchSection,
} from "./components/hr.payroll.benefits-section.component.server";

export * from "./actions";
export * from "./data";
export * from "./events";
export * from "./policies";
export * from "./schemas";
export * from "./contracts";

export { HrBenefitsAccessDeniedPanel, HrBenefitsWorkbenchSection };

export function HrBenefitsAccessDenied() {
  return React.createElement(HrBenefitsAccessDeniedPanel);
}

export function HrBenefitsSection({
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
