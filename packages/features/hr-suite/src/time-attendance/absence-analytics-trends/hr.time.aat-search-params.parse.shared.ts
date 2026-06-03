import {
  hrAatAuditTrailSearchParam,
  hrAatAuditTrailSurfaceKey,
  hrAatNotificationsSearchParam,
  hrAatNotificationsSurfaceKey,
  hrAatRiskIndicatorsSearchParam,
  hrAatRiskIndicatorsSurfaceKey,
  hrAatSnapshotsSearchParam,
  hrAatSnapshotsSurfaceKey,
  HR_AAT_LIST_SEARCH_PARAM_MODEL_FIELDS,
  HR_AAT_LIST_SEARCH_PARAMS_BY_KEY,
  HR_AAT_LIST_SURFACE_COLUMNS_BY_KEY,
  HR_AAT_LIST_SURFACE_KEYS,
  HR_AAT_WORKBENCH_READ_ONLY_SURFACE_KEYS,
  getHrAatListSurfaceKeys,
  type HrAatListSurfaceKey,
} from "./hr.time.aat-surface-metadata.shared";

export {
  getHrAatListSurfaceKeys,
  HR_AAT_LIST_SURFACE_KEYS,
  HR_AAT_LIST_SEARCH_PARAMS_BY_KEY,
  HR_AAT_LIST_SEARCH_PARAM_MODEL_FIELDS,
  HR_AAT_LIST_SURFACE_COLUMNS_BY_KEY,
  HR_AAT_WORKBENCH_READ_ONLY_SURFACE_KEYS,
  hrAatAuditTrailSearchParam,
  hrAatAuditTrailSurfaceKey,
  hrAatNotificationsSearchParam,
  hrAatNotificationsSurfaceKey,
  hrAatRiskIndicatorsSearchParam,
  hrAatRiskIndicatorsSurfaceKey,
  hrAatSnapshotsSearchParam,
  hrAatSnapshotsSurfaceKey,
  type HrAatListSurfaceKey,
};

export type HrAatSearchParams = {
  riskIndicatorsSearch?: string;
  snapshotsSearch?: string;
  notificationsSearch?: string;
  auditTrailSearch?: string;
};

function readSearchParam(
  searchParams: Record<string, string | string[] | undefined> | undefined,
  key: string,
): string | undefined {
  const value = searchParams?.[key];
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  return undefined;
}

export function parseHrAatSearchParams(
  searchParams?: Record<string, string | string[] | undefined>,
): HrAatSearchParams {
  return {
    riskIndicatorsSearch: readSearchParam(
      searchParams,
      hrAatRiskIndicatorsSearchParam,
    ),
    snapshotsSearch: readSearchParam(searchParams, hrAatSnapshotsSearchParam),
    notificationsSearch: readSearchParam(
      searchParams,
      hrAatNotificationsSearchParam,
    ),
    auditTrailSearch: readSearchParam(searchParams, hrAatAuditTrailSearchParam),
  };
}

export type HrAatPageModelInput = {
  organizationId: string;
  actorAuthUserId: string;
  canViewRiskIndicators: boolean;
  canViewAudit: boolean;
  riskIndicatorsSearch?: string;
  snapshotsSearch?: string;
  notificationsSearch?: string;
  auditTrailSearch?: string;
};

export function toHrAatPageModelInput(input: {
  organizationId: string;
  actorAuthUserId: string;
  canViewRiskIndicators: boolean;
  canViewAudit: boolean;
  searchParams?: Record<string, string | string[] | undefined>;
}): HrAatPageModelInput {
  const parsed = parseHrAatSearchParams(input.searchParams);
  return {
    organizationId: input.organizationId,
    actorAuthUserId: input.actorAuthUserId,
    canViewRiskIndicators: input.canViewRiskIndicators,
    canViewAudit: input.canViewAudit,
    ...parsed,
  };
}

function defaultPeriodRange(): { periodStart: Date; periodEnd: Date } {
  const periodEnd = new Date();
  const periodStart = new Date(periodEnd);
  periodStart.setUTCDate(periodStart.getUTCDate() - 30);
  return { periodStart, periodEnd };
}

export { defaultPeriodRange };
