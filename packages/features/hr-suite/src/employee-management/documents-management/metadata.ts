/**
 * Governed metadata door — employee-management/documents-management
 * Surface keys, columns registry, UI copy, and search param parsing only (no builders).
 */
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
  type HrDocumentsListSurfaceKey,
} from "./surface/hr.workforce.documents-surface-metadata.shared";

export { hrDocumentsUiCopy } from "./surface/hr.workforce.documents-ui.copy.shared";

export {
  hrDocumentsOverviewStatSurfaceKey,
  buildHrDocumentsOverviewStatGroups,
} from "./surface/hr.workforce.documents-overview-stat.surface";

export {
  HR_WORKFORCE_DOCUMENTS_ACCEPTANCE_CRITERIA_COVERAGE,
  HR_WORKFORCE_DOCUMENTS_REQUIREMENT_COVERAGE,
  assertHrWorkforceDocumentsEnterpriseCoverage,
  type HrDocumentsCoverageEntry,
  type HrDocumentsCoverageStatus,
  type HrDocumentsRequirementCode,
} from "./data/hr.workforce.documents-coverage.shared";

export {
  parseHrDocumentsSearchParams,
  toHrDocumentsPageModelInput,
  type HrDocumentsSearchParams,
  hrDocumentsRepositorySearchParam,
  hrDocumentsRequirementsSearchParam,
  hrDocumentsMissingSearchParam,
  hrDocumentsExpiringSearchParam,
  hrDocumentsRetentionSearchParam,
  hrDocumentsAuditTrailSearchParam,
  hrDocumentsAcknowledgmentsSearchParam,
} from "./data/hr.workforce.documents-search-params.parse.shared";
