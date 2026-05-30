/**
 * Governed metadata door — employee-management/offboarding-exit-management
 */
export {
  getHrOffboardingListSurfaceKeys,
  HR_OFFBOARDING_LIST_SURFACE_COLUMNS_BY_KEY,
  HR_OFFBOARDING_LIST_SEARCH_PARAMS_BY_KEY,
  HR_OFFBOARDING_LIST_SEARCH_PARAM_MODEL_FIELDS,
  HR_OFFBOARDING_LIST_SURFACE_KEYS,
  HR_OFFBOARDING_WORKBENCH_READ_ONLY_SURFACE_KEYS,
  hrOffboardingExitTypeFilterParam,
  type HrOffboardingListSurfaceKey,
} from "./surface/hr.workforce.offboarding-surface-metadata.shared";

export {
  hrOffboardingCasesSurfaceKey,
  hrOffboardingCasesSearchParam,
} from "./surface/hr.workforce.offboarding-cases-list.surface";

export {
  hrOffboardingClearanceSurfaceKey,
  hrOffboardingClearanceSearchParam,
} from "./surface/hr.workforce.offboarding-clearance-list.surface";

export {
  hrOffboardingApprovalsSurfaceKey,
  hrOffboardingApprovalsSearchParam,
} from "./surface/hr.workforce.offboarding-approvals-list.surface";

export {
  hrOffboardingAssetsSurfaceKey,
  hrOffboardingAssetsSearchParam,
} from "./surface/hr.workforce.offboarding-assets-list.surface";

export {
  hrOffboardingSettlementSurfaceKey,
  hrOffboardingSettlementSearchParam,
} from "./surface/hr.workforce.offboarding-settlement-list.surface";

export {
  hrOffboardingOverdueSurfaceKey,
  hrOffboardingOverdueSearchParam,
} from "./surface/hr.workforce.offboarding-overdue-list.surface";

export {
  hrOffboardingAuditTrailSurfaceKey,
  hrOffboardingAuditTrailSearchParam,
} from "./surface/hr.workforce.offboarding-audit-trail-list.surface";

export {
  hrOffboardingOverviewStatSurfaceKey,
  buildHrOffboardingOverviewStatGroups,
} from "./surface/hr.workforce.offboarding-overview-stat.surface";

export { hrOffboardingUiCopy } from "./surface/hr.workforce.offboarding-ui.copy.shared";

export {
  parseHrOffboardingSearchParams,
  toHrOffboardingPageModelInput,
  type HrOffboardingSearchParams,
} from "./data/hr.workforce.offboarding-search-params.parse.shared";
