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
  HR_COMPLIANCE_LIST_SEARCH_PARAMS_BY_KEY,
  HR_COMPLIANCE_LIST_SEARCH_PARAM_MODEL_FIELDS,
  HR_COMPLIANCE_LIST_SURFACE_KEYS,
  HR_COMPLIANCE_WORKBENCH_READ_ONLY_SURFACE_KEYS,
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
  parseHrComplianceSearchParams,
  toHrCompliancePageModelInput,
  type HrComplianceSearchParams,
  type HrComplianceListSurfaceKey,
  hrComplianceExceptionSearchParam,
  hrComplianceFilingSearchParam,
  hrComplianceRegulatoryCalendarSearchParam,
  hrComplianceAlertsSearchParam,
  hrComplianceLaborLawSearchParam,
  hrComplianceObligationSearchParam,
  hrCompliancePolicyAcknowledgementSearchParam,
  hrComplianceSafetyTrainingSearchParam,
  hrComplianceWorkplaceSafetySearchParam,
  hrComplianceWorkAuthDocumentSearchParam,
  hrComplianceWorkEligibilitySearchParam,
  hrComplianceEvidenceLinksSurfaceKey,
  hrComplianceEvidenceLinksSearchParam,
  hrComplianceAuditTrailSurfaceKey,
  hrComplianceAuditTrailSearchParam,
  hrComplianceReviewQueueSurfaceKey,
  hrComplianceReviewQueueSearchParam,
} from "./employee-management/compliance-regulatory-tracking/metadata";

export {
  hrComplianceRoutePaths,
  type HrComplianceRoutePath,
} from "./employee-management/compliance-regulatory-tracking/contracts/hr.workforce.compliance-route.contract";

export {
  resolveHrModuleNavItems,
  type HrModuleNavItem,
} from "./contracts/hr-module-nav.contract";

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
