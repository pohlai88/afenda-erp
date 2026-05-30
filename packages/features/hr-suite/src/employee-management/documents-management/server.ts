import React from "react";

import { SectionPanel } from "@afenda/ui";

import {
  HrDocumentsAccessDeniedPanel,
  HrDocumentsWorkbenchSection,
} from "./components/hr.workforce.documents-section.component.server";

/**
 * Server door — employee-management/documents-management
 */
export * from "./actions";
export * from "./data";
export * from "./events";
export * from "./policies";
export * from "./schemas";
export * from "./contracts";

export { HrDocumentsAccessDeniedPanel, HrDocumentsWorkbenchSection };

export function HrDocumentsAccessDenied() {
  return React.createElement(HrDocumentsAccessDeniedPanel);
}

export function HrDocumentsSection({
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
