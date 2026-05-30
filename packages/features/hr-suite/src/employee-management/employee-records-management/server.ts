import React from "react";

import { SectionPanel } from "@afenda/ui";

import {
  HrRecordsAccessDeniedPanel,
  HrRecordsDetailNotFoundPanel,
  HrRecordsDetailSection,
  HrRecordsWorkbenchSection,
} from "./components";

/**
 * Server door — employee-management/employee-records-management
 */
export * from "./actions";
export * from "./data";
export * from "./events";
export * from "./policies";
export * from "./schemas";
export {
  hrWorkforceRecordsReadPermission,
  hrWorkforceRecordsWritePermission,
  hrWorkforceRecordsSensitiveReadPermission,
} from "./contracts/hr.workforce.records.contract";
export {
  hrRecordsRoutePaths,
  type HrRecordsRoutePath,
} from "./contracts/hr.workforce.records-route.contract";

export {
  HrRecordsAccessDeniedPanel,
  HrRecordsDetailNotFoundPanel,
  HrRecordsDetailSection,
  HrRecordsWorkbenchSection,
};

export function HrRecordsAccessDenied() {
  return React.createElement(HrRecordsAccessDeniedPanel);
}

export function HrEmployeesSection({
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

/** @deprecated Use requireHrRecordsRead from this slice. */
export { requireHrRecordsRead as requireHrEmployeesRead } from "./policies/hr.workforce.records-access.policy.server";
/** @deprecated Use requireHrRecordsWrite from this slice. */
export { requireHrRecordsWrite as requireHrEmployeesWrite } from "./policies/hr.workforce.records-access.policy.server";
/** @deprecated Use buildHrRecordsPageModel from this slice. */
export { buildHrRecordsPageModel as buildHrEmployeesPageModel } from "./data/hr.workforce.records.page-model.server";
/** @deprecated Use HrRecordsAccessDeniedPanel from this slice. */
export { HrRecordsAccessDeniedPanel as HrEmployeesAccessDenied } from "./components/hr.workforce.records-section.component.server";
