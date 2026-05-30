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
  hrComplianceExceptionsSurfaceKey,
  hrComplianceLaborLawRequirementsSurfaceKey,
  hrComplianceObligationsSurfaceKey,
  hrComplianceUiCopy,
} from "./employee-management/compliance-regulatory-tracking/metadata";

export {
  hrComplianceRoutePaths,
  type HrComplianceRoutePath,
} from "./employee-management/compliance-regulatory-tracking/contracts/hr.workforce.compliance-route.contract";

export {
  resolveHrModuleNavItems,
  type HrModuleNavItem,
} from "./navigation/hr-module-nav.contract";

export {
  hrComplianceExceptionSearchParam,
} from "./employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-exceptions-list.surface";
export {
  hrComplianceLaborLawSearchParam,
} from "./employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-labor-law-requirements-list.surface";
export {
  hrComplianceObligationSearchParam,
} from "./employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-obligations-list.surface";

export const hrDocumentsUiCopy = {
  page: {
    title: "Documents",
    description: "Documents are managed by HR Suite.",
  } satisfies HrUiCopyPage,
};

export {
  getHrRecordsListSurfaceKeys,
  HR_RECORDS_LIST_SURFACE_COLUMNS_BY_KEY,
  HR_RECORDS_LIST_SEARCH_PARAMS_BY_KEY,
  HR_RECORDS_LIST_SEARCH_PARAM_MODEL_FIELDS,
  HR_RECORDS_LIST_SURFACE_KEYS,
  HR_RECORDS_WORKBENCH_READ_ONLY_SURFACE_KEYS,
  hrRecordsDirectorySurfaceKey,
  hrRecordsIncompleteSurfaceKey,
  hrRecordsAssignmentsSurfaceKey,
  hrRecordsAuditTrailSurfaceKey,
  hrRecordsStatusHistorySurfaceKey,
  hrRecordsDocumentReferencesSurfaceKey,
  hrRecordsSeparatedSurfaceKey,
  hrRecordsUiCopy,
  parseHrRecordsSearchParams,
  toHrRecordsPageModelInput,
  type HrRecordsSearchParams,
  type HrRecordsListSurfaceKey,
  hrRecordsDirectorySearchParam,
  hrRecordsIncompleteSearchParam,
  hrRecordsAssignmentsSearchParam,
  hrRecordsAuditTrailSearchParam,
  hrRecordsStatusHistorySearchParam,
  hrRecordsDocumentReferencesSearchParam,
  hrRecordsSeparatedSearchParam,
  hrRecordsEmploymentStatusFilterParam,
} from "./employee-management/employee-records-management/metadata";

export {
  hrRecordsRoutePaths,
  hrEmployeeDetailRoutePath,
  type HrRecordsRoutePath,
} from "./employee-management/employee-records-management/contracts/hr.workforce.records-route.contract";

/** @deprecated Use hrRecordsUiCopy */
export { hrRecordsUiCopy as hrEmployeesUiCopy } from "./employee-management/employee-records-management/metadata";

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
