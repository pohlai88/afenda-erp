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
} from "./hr.time.aat-surface-metadata.shared";

export {
  parseHrAatSearchParams,
  toHrAatPageModelInput,
  type HrAatSearchParams,
} from "./hr.time.aat-search-params.parse.shared";

export { hrAatUiCopy } from "./hr.time.aat-ui.copy.shared";

export {
  hrAatRoutePaths,
  type HrAatRoutePath,
} from "./hr.time.aat-route.contract";

export {
  buildHrAatRiskIndicatorsListSurface,
} from "./hr.time.aat-risk-indicators-list.surface";
export {
  buildHrAatSnapshotsListSurface,
} from "./hr.time.aat-snapshots-list.surface";
export {
  buildHrAatNotificationsListSurface,
} from "./hr.time.aat-notifications-list.surface";
export {
  buildHrAatAuditTrailListSurface,
} from "./hr.time.aat-audit-trail-list.surface";
export { buildHrAatOverviewStatGrid } from "./hr.time.aat-overview-stat.surface";

export {
  assertAatIntegrationCoverageComplete,
  AAT_INTEGRATION_REQUIREMENT_COVERAGE,
} from "./hr.time.aat-acceptance-coverage.shared";
