export const hrAatOverviewStatSurfaceKey = "hr.time.aat.overview.stats";

export const hrAatRiskIndicatorsSurfaceKey = "hr.time.aat.risk-indicators.list";
export const hrAatSnapshotsSurfaceKey = "hr.time.aat.snapshots.list";
export const hrAatNotificationsSurfaceKey = "hr.time.aat.notifications.list";
export const hrAatAuditTrailSurfaceKey = "hr.time.aat.audit-trail.list";

export const hrAatRiskIndicatorsSearchParam = "aatRiskIndicatorsSearch";
export const hrAatSnapshotsSearchParam = "aatSnapshotsSearch";
export const hrAatNotificationsSearchParam = "aatNotificationsSearch";
export const hrAatAuditTrailSearchParam = "aatAuditTrailSearch";

export const hrAatRiskIndicatorsColumnsId = "hr.time.aat.risk-indicators.columns";
export const hrAatSnapshotsColumnsId = "hr.time.aat.snapshots.columns";
export const hrAatNotificationsColumnsId = "hr.time.aat.notifications.columns";
export const hrAatAuditTrailColumnsId = "hr.time.aat.audit-trail.columns";

export const HR_AAT_LIST_SURFACE_KEYS = [
  hrAatRiskIndicatorsSurfaceKey,
  hrAatSnapshotsSurfaceKey,
  hrAatNotificationsSurfaceKey,
  hrAatAuditTrailSurfaceKey,
] as const;

export type HrAatListSurfaceKey = (typeof HR_AAT_LIST_SURFACE_KEYS)[number];

export const HR_AAT_WORKBENCH_READ_ONLY_SURFACE_KEYS = [
  hrAatSnapshotsSurfaceKey,
  hrAatAuditTrailSurfaceKey,
] as const;

export const HR_AAT_LIST_SEARCH_PARAMS_BY_KEY = {
  [hrAatRiskIndicatorsSurfaceKey]: hrAatRiskIndicatorsSearchParam,
  [hrAatSnapshotsSurfaceKey]: hrAatSnapshotsSearchParam,
  [hrAatNotificationsSurfaceKey]: hrAatNotificationsSearchParam,
  [hrAatAuditTrailSurfaceKey]: hrAatAuditTrailSearchParam,
} as const;

export const HR_AAT_LIST_SEARCH_PARAM_MODEL_FIELDS = {
  [hrAatRiskIndicatorsSearchParam]: "riskIndicatorsSearch",
  [hrAatSnapshotsSearchParam]: "snapshotsSearch",
  [hrAatNotificationsSearchParam]: "notificationsSearch",
  [hrAatAuditTrailSearchParam]: "auditTrailSearch",
} as const;

export const HR_AAT_LIST_SURFACE_COLUMNS_BY_KEY = {
  [hrAatRiskIndicatorsSurfaceKey]: hrAatRiskIndicatorsColumnsId,
  [hrAatSnapshotsSurfaceKey]: hrAatSnapshotsColumnsId,
  [hrAatNotificationsSurfaceKey]: hrAatNotificationsColumnsId,
  [hrAatAuditTrailSurfaceKey]: hrAatAuditTrailColumnsId,
} as const;

export function getHrAatListSurfaceKeys(): readonly HrAatListSurfaceKey[] {
  return HR_AAT_LIST_SURFACE_KEYS;
}
