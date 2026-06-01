/**
 * Governed metadata door — employee-management/employee-records-management
 */
export {
  getHrRecordsListSurfaceKeys,
  HR_RECORDS_LIST_SURFACE_COLUMNS_BY_KEY,
  HR_RECORDS_LIST_SEARCH_PARAMS_BY_KEY,
  HR_RECORDS_LIST_SEARCH_PARAM_MODEL_FIELDS,
  HR_RECORDS_LIST_SURFACE_KEYS,
  HR_RECORDS_WORKBENCH_READ_ONLY_SURFACE_KEYS,
  type HrRecordsListSurfaceKey,
} from "./surface/hr.workforce.records-surface-metadata.shared";

export {
  hrRecordsDirectorySurfaceKey,
  hrRecordsDirectorySearchParam,
  hrRecordsEmploymentStatusFilterParam,
} from "./surface/hr.workforce.records-directory-list.surface";

export {
  hrRecordsIncompleteSurfaceKey,
  hrRecordsIncompleteSearchParam,
} from "./surface/hr.workforce.records-incomplete-list.surface";

export {
  hrRecordsAssignmentsSurfaceKey,
  hrRecordsAssignmentsSearchParam,
} from "./surface/hr.workforce.records-assignments-list.surface";

export {
  hrRecordsAuditTrailSurfaceKey,
  hrRecordsAuditTrailSearchParam,
} from "./surface/hr.workforce.records-audit-trail-list.surface";

export {
  hrRecordsStatusHistorySurfaceKey,
  hrRecordsStatusHistorySearchParam,
} from "./surface/hr.workforce.records-status-history-list.surface";

export {
  hrRecordsDocumentReferencesSurfaceKey,
  hrRecordsDocumentReferencesSearchParam,
} from "./surface/hr.workforce.records-document-references-list.surface";

export {
  hrRecordsSeparatedSurfaceKey,
  hrRecordsSeparatedSearchParam,
} from "./surface/hr.workforce.records-separated-list.surface";

export {
  hrEmployeeDetailRoutePath,
  hrRecordsRoutePaths,
  type HrRecordsRoutePath,
} from "./contracts/hr.workforce.records-route.contract";

export { hrRecordsUiCopy } from "./surface/hr.workforce.records-ui.copy.shared";

export {
  HR_WORKFORCE_RECORDS_ACCEPTANCE_CRITERIA_COVERAGE,
  HR_WORKFORCE_RECORDS_REQUIREMENT_COVERAGE,
  assertHrWorkforceRecordsEnterpriseCoverage,
  type HrRecordsCoverageEntry,
  type HrRecordsCoverageStatus,
  type HrRecordsRequirementCode,
} from "./data/hr.workforce.records-coverage.shared";

export {
  hrRecordsOverviewStatSurfaceKey,
  buildHrRecordsOverviewStatGroups,
} from "./surface/hr.workforce.records-overview-stat.surface";

export {
  parseHrRecordsSearchParams,
  toHrRecordsPageModelInput,
  type HrRecordsSearchParams,
} from "./data/hr.workforce.records-search-params.parse.shared";
