export {
  getHrIndustryUcbListSurfaceKeys,
  HR_INDUSTRY_UCB_LIST_SEARCH_PARAM_MODEL_FIELDS,
  HR_INDUSTRY_UCB_LIST_SEARCH_PARAMS_BY_KEY,
  HR_INDUSTRY_UCB_LIST_SURFACE_COLUMNS_BY_KEY,
  HR_INDUSTRY_UCB_LIST_SURFACE_KEYS,
  HR_INDUSTRY_UCB_READ_ONLY_LIST_SURFACE_KEYS,
  hrIndustryUcbAgreementsSurfaceKey,
  hrIndustryUcbAlertsSurfaceKey,
  hrIndustryUcbAssignmentsSurfaceKey,
  hrIndustryUcbAuditTrailSurfaceKey,
  hrIndustryUcbDisputesSurfaceKey,
  hrIndustryUcbDuesReferencesSurfaceKey,
  hrIndustryUcbGrievancesSurfaceKey,
  hrIndustryUcbIntegrationExposuresSurfaceKey,
  hrIndustryUcbLaborMeetingsSurfaceKey,
  hrIndustryUcbMembershipsSurfaceKey,
  hrIndustryUcbOverviewKpiSurfaceKey,
  hrIndustryUcbRepresentativesSurfaceKey,
  hrIndustryUcbReportsSurfaceKey,
  hrIndustryUcbRuleConflictsSurfaceKey,
  hrIndustryUcbRuleReferencesSurfaceKey,
  hrIndustryUcbSenioritySurfaceKey,
  hrIndustryUcbUnionsSurfaceKey,
  type HrIndustryUcbListSurfaceKey,
} from "./surface/hr.industry.ucb-surface-metadata.shared";

export { hrIndustryUcbUiCopy } from "./surface/hr.industry.ucb-ui.copy.shared";

export {
  hrIndustryUcbReportGroupByParam,
  hrIndustryUcbStatusParam,
  parseHrIndustryUcbSearchParams,
  toHrIndustryUcbPageModelInput,
  type HrIndustryUcbPageModelInput,
  type HrIndustryUcbSearchParams,
  type HrIndustryUcbStatusFilter,
} from "./data/hr.industry.ucb-search-params.parse.shared";

export {
  hrIndustryUcbRoutePaths,
  type HrIndustryUcbRoutePath,
} from "./contracts/hr.industry.ucb-route.contract";

export {
  HR_INDUSTRY_UCB_ACCEPTANCE_CRITERIA_COVERAGE,
  HR_INDUSTRY_UCB_REQUIREMENT_COVERAGE,
  assertHrIndustryUcbAcceptanceCriteriaComplete,
  assertHrIndustryUcbCoverageComplete,
  assertHrIndustryUcbEnterpriseCoverage,
  assertHrIndustryUcbScaffoldOnly,
} from "./data/hr.industry.ucb-coverage.shared";
