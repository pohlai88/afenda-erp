import { createModuleFeatureMetadata } from "@afenda/kernel";

/**
 * Governed metadata door.
 * Runtime authority stays in server actions, queries, and policies.
 */
export const {
  moduleId,
  buildRecordListSurface,
  buildWorkItemListSurface,
  buildCountStatGrid,
  buildStatGrid,
  buildOverviewStatGrid,
  buildSavedViewsListSurface,
  buildDocumentRegistryListSurface,
  buildRecordDetailTabs,
  buildWorkItemDetailTabs,
  buildWorkItemKanbanSurface,
  getListSurfaceKeys,
  getOverviewStatSurfaceKey,
  getStatSurfaceKey,
  getWorkItemKanbanSurfaceKey,
} = createModuleFeatureMetadata("hr");

type HrUiCopyPage = { title: string; description: string; addEmployeeLabel?: string };

export const hrAttendanceUiCopy = {
  page: {
    title: "Attendance",
    description: "Attendance is managed by HR Suite.",
  } satisfies HrUiCopyPage,
};

export {
  getHrComplianceListSurfaceKeys,
  HR_COMPLIANCE_LIST_SURFACE_COLUMNS_BY_KEY,
  HR_COMPLIANCE_LIST_SURFACE_KEYS,
  hrComplianceExceptionsSurfaceKey,
  hrComplianceFilingsSurfaceKey,
  hrComplianceLaborLawRequirementsSurfaceKey,
  hrComplianceObligationsSurfaceKey,
  hrCompliancePolicyAcknowledgementsSurfaceKey,
  hrComplianceRegulatoryCalendarSurfaceKey,
  hrComplianceAlertsSurfaceKey,
  hrComplianceSafetyTrainingRequirementsSurfaceKey,
  hrComplianceWorkAuthDocumentsSurfaceKey,
  hrComplianceWorkEligibilitySurfaceKey,
  hrComplianceWorkplaceSafetyRequirementsSurfaceKey,
  hrComplianceUiCopy,
  type HrComplianceListSurfaceKey,
} from "./employee-management/compliance-regulatory-tracking/metadata";

export {
  hrComplianceRoutePaths,
  type HrComplianceRoutePath,
} from "./employee-management/compliance-regulatory-tracking/contracts/hr.workforce.compliance-route.contract";

export {
  resolveHrModuleNavItems,
  type HrModuleNavItem,
} from "./contracts/hr-module-nav.contract";

export {
  hrComplianceExceptionSearchParam,
} from "./employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-exceptions-list.surface";
export {
  hrComplianceFilingSearchParam,
} from "./employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-filings-list.surface";
export {
  hrComplianceLaborLawSearchParam,
} from "./employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-labor-law-requirements-list.surface";
export {
  hrCompliancePolicyAcknowledgementSearchParam,
} from "./employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-policy-acknowledgements-list.surface";
export {
  hrComplianceSafetyTrainingSearchParam,
} from "./employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-safety-training-requirements-list.surface";
export {
  hrComplianceWorkplaceSafetySearchParam,
} from "./employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-workplace-safety-list.surface";
export {
  hrComplianceWorkAuthDocumentSearchParam,
} from "./employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-work-auth-documents-list.surface";
export {
  hrComplianceWorkEligibilitySearchParam,
} from "./employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-work-eligibility-list.surface";
export {
  hrComplianceObligationSearchParam,
} from "./employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-obligations-list.surface";
export {
  hrComplianceRegulatoryCalendarSearchParam,
} from "./employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-regulatory-calendar-list.surface";
export {
  hrComplianceAlertsSearchParam,
} from "./employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-alerts-list.surface";

export {
  parseHrComplianceSearchParams,
  type HrComplianceSearchParams,
} from "./employee-management/compliance-regulatory-tracking/data/hr.workforce.compliance-search-params.parse.shared";

export const hrDocumentsUiCopy = {
  page: {
    title: "Documents",
    description: "Documents are managed by HR Suite.",
  } satisfies HrUiCopyPage,
};

export const hrEmployeesUiCopy = {
  page: {
    title: "Employees",
    description: "Employees are managed by HR Suite.",
    addEmployeeLabel: "Add employee",
  } satisfies HrUiCopyPage,
  create: {
    accessDeniedTitle: "Access restricted",
    accessDeniedDescription: "You don’t have permission to add employees.",
    backLabel: "Back to employees",
  },
  detail: {
    notFoundTitle: "Employee unavailable",
    notFoundDescription: "This employee record is not available.",
    backLabel: "Back to employees",
  },
};

export const hrLeaveUiCopy = {
  page: {
    title: "Leave",
    description: "Leave is managed by HR Suite.",
  } satisfies HrUiCopyPage,
};

export const hrLifecycleUiCopy = {
  page: {
    title: "Lifecycle",
    description: "Lifecycle is managed by HR Suite.",
  } satisfies HrUiCopyPage,
};

export const hrOffboardingUiCopy = {
  page: {
    title: "Offboarding",
    description: "Offboarding is managed by HR Suite.",
  } satisfies HrUiCopyPage,
};

export const hrOnboardingUiCopy = {
  page: {
    title: "Onboarding",
    description: "Onboarding is managed by HR Suite.",
  } satisfies HrUiCopyPage,
};

export const hrOvertimeUiCopy = {
  page: {
    title: "Overtime",
    description: "Overtime is managed by HR Suite.",
  } satisfies HrUiCopyPage,
};

export const hrShiftsUiCopy = {
  page: {
    title: "Shifts",
    description: "Shifts are managed by HR Suite.",
  } satisfies HrUiCopyPage,
};
