export {
  getHrAatListSurfaceKeys,
  HR_AAT_LIST_SURFACE_COLUMNS_BY_KEY,
  HR_AAT_LIST_SEARCH_PARAMS_BY_KEY,
  HR_AAT_LIST_SEARCH_PARAM_MODEL_FIELDS,
  HR_AAT_LIST_SURFACE_KEYS,
  HR_AAT_WORKBENCH_READ_ONLY_SURFACE_KEYS,
  hrAatAuditTrailSearchParam,
  hrAatAuditTrailSurfaceKey,
  hrAatNotificationsSearchParam,
  hrAatNotificationsSurfaceKey,
  hrAatRiskIndicatorsSearchParam,
  hrAatRiskIndicatorsSurfaceKey,
  hrAatSnapshotsSearchParam,
  hrAatSnapshotsSurfaceKey,
  hrAatOverviewStatSurfaceKey,
  type HrAatListSurfaceKey,
} from "./surface/hr.time.aat-surface-metadata.shared";

export {
  parseHrAatSearchParams,
  toHrAatPageModelInput,
  type HrAatSearchParams,
} from "./data/hr.time.aat-search-params.parse.shared";

export { hrAatUiCopy } from "./surface/hr.time.aat-ui.copy.shared";

export {
  hrAatRoutePaths,
  type HrAatRoutePath,
} from "./contracts/hr.time.aat-route.contract";

export {
  buildHrAatRiskIndicatorsListSurface,
} from "./surface/hr.time.aat-risk-indicators-list.surface";
export {
  buildHrAatSnapshotsListSurface,
} from "./surface/hr.time.aat-snapshots-list.surface";
export {
  buildHrAatNotificationsListSurface,
} from "./surface/hr.time.aat-notifications-list.surface";
export {
  buildHrAatAuditTrailListSurface,
} from "./surface/hr.time.aat-audit-trail-list.surface";
export { buildHrAatOverviewStatGrid } from "./surface/hr.time.aat-overview-stat.surface";

export {
  assertAatIntegrationCoverageComplete,
  AAT_INTEGRATION_REQUIREMENT_COVERAGE,
} from "./data/hr.time.aat-acceptance-coverage.shared";
