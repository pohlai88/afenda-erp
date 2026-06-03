/**
 * Governed metadata door — employee-management/compliance-regulatory-tracking
 * Surface keys, columns registry, UI copy, and search param parsing only (no builders).
 */
export {
  getHrComplianceListSurfaceKeys,
  HR_COMPLIANCE_LIST_SURFACE_COLUMNS_BY_KEY,
  HR_COMPLIANCE_LIST_SEARCH_PARAMS_BY_KEY,
  HR_COMPLIANCE_LIST_SEARCH_PARAM_MODEL_FIELDS,
  HR_COMPLIANCE_LIST_SURFACE_KEYS,
  HR_COMPLIANCE_WORKBENCH_READ_ONLY_SURFACE_KEYS,
  hrComplianceAlertsSurfaceKey,
  hrComplianceReviewQueueSurfaceKey,
  hrComplianceExceptionsSurfaceKey,
  hrComplianceFilingsSurfaceKey,
  hrComplianceLaborLawRequirementsSurfaceKey,
  hrComplianceStatutoryRequirementsSurfaceKey,
  hrComplianceObligationsSurfaceKey,
  hrCompliancePolicyAcknowledgementsSurfaceKey,
  hrComplianceRegulatoryCalendarSurfaceKey,
  hrComplianceSafetyTrainingRequirementsSurfaceKey,
  hrComplianceWorkAuthDocumentsSurfaceKey,
  hrComplianceWorkEligibilitySurfaceKey,
  hrComplianceWorkplaceSafetyRequirementsSurfaceKey,
  hrComplianceEvidenceLinksSurfaceKey,
  hrComplianceAuditTrailSurfaceKey,
  type HrComplianceListSurfaceKey,
} from "./hr.workforce.compliance-surface-metadata.shared";

export { hrComplianceUiCopy } from "./hr.workforce.compliance-ui.copy.shared";

export {
  hrComplianceOverviewStatSurfaceKey,
  buildHrComplianceOverviewStatGroups,
} from "./hr.workforce.compliance-overview-stat.surface";

export {
  hrComplianceOverviewBreakdownSurfaceKey,
} from "./hr.workforce.compliance-overview-breakdown-list.surface";

export {
  HR_WORKFORCE_COMPLIANCE_ACCEPTANCE_CRITERIA_COVERAGE,
  HR_WORKFORCE_COMPLIANCE_REQUIREMENT_COVERAGE,
  assertHrWorkforceComplianceEnterpriseCoverage,
  type HrComplianceCoverageEntry,
  type HrComplianceCoverageStatus,
  type HrComplianceRequirementCode,
} from "./hr.workforce.compliance-coverage.shared";

export {
  parseHrComplianceSearchParams,
  toHrCompliancePageModelInput,
  type HrComplianceSearchParams,
  hrComplianceAlertsSearchParam,
  hrComplianceExceptionSearchParam,
  hrComplianceFilingSearchParam,
  hrComplianceLaborLawSearchParam,
  hrComplianceStatutorySearchParam,
  hrComplianceObligationSearchParam,
  hrCompliancePolicyAcknowledgementSearchParam,
  hrComplianceRegulatoryCalendarSearchParam,
  hrComplianceSafetyTrainingSearchParam,
  hrComplianceWorkAuthDocumentSearchParam,
  hrComplianceWorkEligibilitySearchParam,
  hrComplianceWorkplaceSafetySearchParam,
  hrComplianceEvidenceLinksSearchParam,
  hrComplianceAuditTrailSearchParam,
  hrComplianceReviewQueueSearchParam,
} from "./hr.workforce.compliance-search-params.parse.shared";
