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

export { hrLamUiCopy as hrLeaveUiCopy } from "./time-attendance/leave-attendance-management/metadata";

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
  hrComplianceStatutoryRequirementsSurfaceKey,
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
  hrComplianceStatutorySearchParam,
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

export {
  getHrDocumentsListSurfaceKeys,
  HR_DOCUMENTS_LIST_SURFACE_COLUMNS_BY_KEY,
  HR_DOCUMENTS_LIST_SEARCH_PARAMS_BY_KEY,
  HR_DOCUMENTS_LIST_SEARCH_PARAM_MODEL_FIELDS,
  HR_DOCUMENTS_LIST_SURFACE_KEYS,
  HR_DOCUMENTS_WORKBENCH_READ_ONLY_SURFACE_KEYS,
  hrDocumentsRepositorySurfaceKey,
  hrDocumentsRequirementsSurfaceKey,
  hrDocumentsMissingSurfaceKey,
  hrDocumentsExpiringSurfaceKey,
  hrDocumentsRetentionSurfaceKey,
  hrDocumentsAuditTrailSurfaceKey,
  hrDocumentsAcknowledgmentsSurfaceKey,
  hrDocumentsUiCopy,
  parseHrDocumentsSearchParams,
  toHrDocumentsPageModelInput,
  type HrDocumentsSearchParams,
  type HrDocumentsListSurfaceKey,
  hrDocumentsRepositorySearchParam,
  hrDocumentsRequirementsSearchParam,
  hrDocumentsMissingSearchParam,
  hrDocumentsExpiringSearchParam,
  hrDocumentsRetentionSearchParam,
  hrDocumentsAuditTrailSearchParam,
  hrDocumentsAcknowledgmentsSearchParam,
} from "./employee-management/documents-management/metadata";

export {
  hrDocumentsRoutePaths,
  type HrDocumentsRoutePath,
} from "./employee-management/documents-management/contracts/hr.workforce.documents-route.contract";

export {
  getHrOrgListSurfaceKeys,
  HR_ORG_LIST_SURFACE_COLUMNS_BY_KEY,
  HR_ORG_LIST_SEARCH_PARAMS_BY_KEY,
  HR_ORG_LIST_SEARCH_PARAM_MODEL_FIELDS,
  HR_ORG_LIST_SURFACE_KEYS,
  HR_ORG_WORKBENCH_READ_ONLY_SURFACE_KEYS,
  hrOrgUnitsSurfaceKey,
  hrOrgPositionsSurfaceKey,
  hrOrgReportingLinesSurfaceKey,
  hrOrgVacanciesSurfaceKey,
  hrOrgHeadcountSurfaceKey,
  hrOrgAuditTrailSurfaceKey,
  hrOrgUiCopy,
  parseHrOrgSearchParams,
  toHrOrgPageModelInput,
  type HrOrgSearchParams,
  type HrOrgListSurfaceKey,
  hrOrgUnitsSearchParam,
  hrOrgPositionsSearchParam,
  hrOrgReportingLinesSearchParam,
  hrOrgVacanciesSearchParam,
  hrOrgHeadcountSearchParam,
  hrOrgAuditTrailSearchParam,
  hrOrgUnitTypeFilterParam,
  hrOrgStatusFilterParam,
  hrOrgLocationFilterParam,
  hrOrgLegalEntityFilterParam,
} from "./employee-management/organizational-chart-hierarchy/metadata";

export {
  hrOrgRoutePaths,
  type HrOrgRoutePath,
} from "./employee-management/organizational-chart-hierarchy/contracts/hr.workforce.org-route.contract";

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

export {
  getHrLamListSurfaceKeys,
  HR_LAM_LIST_SURFACE_COLUMNS_BY_KEY,
  HR_LAM_LIST_SEARCH_PARAMS_BY_KEY,
  HR_LAM_LIST_SEARCH_PARAM_MODEL_FIELDS,
  HR_LAM_LIST_SURFACE_KEYS,
  HR_LAM_WORKBENCH_READ_ONLY_SURFACE_KEYS,
  hrLamAttendanceDaysSurfaceKey,
  hrLamAttendanceDaysSearchParam,
  hrLamLeaveRequestsSurfaceKey,
  hrLamLeaveRequestsSearchParam,
  hrLamLeaveBalancesSurfaceKey,
  hrLamLeaveBalancesSearchParam,
  hrLamUiCopy,
  parseHrLamSearchParams,
  toHrLamPageModelInput,
  type HrLamSearchParams,
  type HrLamListSurfaceKey,
  hrLamRoutePaths,
  type HrLamRoutePath,
} from "./time-attendance/leave-attendance-management/metadata";

/** @deprecated Use hrLamUiCopy */
export { hrLamUiCopy as hrLeaveAttendanceUiCopy } from "./time-attendance/leave-attendance-management/metadata";

export {
  getHrLifecycleListSurfaceKeys,
  HR_LIFECYCLE_LIST_SURFACE_COLUMNS_BY_KEY,
  HR_LIFECYCLE_LIST_SEARCH_PARAMS_BY_KEY,
  HR_LIFECYCLE_LIST_SEARCH_PARAM_MODEL_FIELDS,
  HR_LIFECYCLE_LIST_SURFACE_KEYS,
  HR_LIFECYCLE_WORKBENCH_READ_ONLY_SURFACE_KEYS,
  hrLifecycleOverviewSurfaceKey,
  hrLifecyclePendingTransitionsSurfaceKey,
  hrLifecyclePendingTransitionsSearchParam,
  hrLifecycleProbationDueSurfaceKey,
  hrLifecycleProbationDueSearchParam,
  hrLifecycleAuditTrailSurfaceKey,
  hrLifecycleAuditTrailSearchParam,
  hrLifecycleOnboardingCasesSurfaceKey,
  hrLifecycleOnboardingCasesSearchParam,
  hrLifecycleNoticePeriodSurfaceKey,
  hrLifecycleNoticePeriodSearchParam,
  hrLifecycleOffboardingCasesSurfaceKey,
  hrLifecycleOffboardingCasesSearchParam,
  hrLifecycleUiCopy,
  parseHrLifecycleSearchParams,
  toHrLifecyclePageModelInput,
  type HrLifecycleSearchParams,
  type HrLifecycleListSurfaceKey,
  hrLifecycleOverviewSearchParam,
  hrLifecycleEmploymentStatusFilterParam,
} from "./employee-management/employee-lifecycle-management/metadata";

export {
  hrLifecycleRoutePaths,
  type HrLifecycleRoutePath,
} from "./employee-management/employee-lifecycle-management/contracts/hr.workforce.lifecycle-route.contract";

export {
  getHrOffboardingListSurfaceKeys,
  HR_OFFBOARDING_LIST_SURFACE_COLUMNS_BY_KEY,
  HR_OFFBOARDING_LIST_SEARCH_PARAMS_BY_KEY,
  HR_OFFBOARDING_LIST_SEARCH_PARAM_MODEL_FIELDS,
  HR_OFFBOARDING_LIST_SURFACE_KEYS,
  HR_OFFBOARDING_WORKBENCH_READ_ONLY_SURFACE_KEYS,
  hrOffboardingCasesSurfaceKey,
  hrOffboardingCasesSearchParam,
  hrOffboardingClearanceSurfaceKey,
  hrOffboardingClearanceSearchParam,
  hrOffboardingUiCopy,
  parseHrOffboardingSearchParams,
  toHrOffboardingPageModelInput,
  type HrOffboardingSearchParams,
  type HrOffboardingListSurfaceKey,
} from "./employee-management/offboarding-exit-management/metadata";

export {
  hrOffboardingRoutePaths,
  type HrOffboardingRoutePath,
} from "./employee-management/offboarding-exit-management/contracts/hr.workforce.offboarding-route.contract";

export {
  getHrBenefitsListSurfaceKeys,
  HR_BENEFITS_LIST_SURFACE_COLUMNS_BY_KEY,
  HR_BENEFITS_LIST_SEARCH_PARAMS_BY_KEY,
  HR_BENEFITS_LIST_SEARCH_PARAM_MODEL_FIELDS,
  HR_BENEFITS_LIST_SURFACE_KEYS,
  HR_BENEFITS_WORKBENCH_READ_ONLY_SURFACE_KEYS,
  hrBenefitsAuditTrailSearchParam,
  hrBenefitsAuditTrailSurfaceKey,
  hrBenefitsEligibilityRulesSearchParam,
  hrBenefitsEligibilityRulesSurfaceKey,
  hrBenefitsEnrollmentsSearchParam,
  hrBenefitsEnrollmentsSurfaceKey,
  hrBenefitsOpenEnrollmentSearchParam,
  hrBenefitsOpenEnrollmentSurfaceKey,
  hrBenefitsPlansSearchParam,
  hrBenefitsPlansSurfaceKey,
  hrBenefitsProvidersSearchParam,
  hrBenefitsProvidersSurfaceKey,
  hrBenefitsUiCopy,
  parseHrBenefitsSearchParams,
  toHrBenefitsPageModelInput,
  type HrBenefitsSearchParams,
  type HrBenefitsListSurfaceKey,
} from "./payroll-compensation/benefits-administration/metadata";

export {
  hrBenefitsRoutePaths,
  type HrBenefitsRoutePath,
} from "./payroll-compensation/benefits-administration/contracts/hr.payroll.benefits-route.contract";

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
