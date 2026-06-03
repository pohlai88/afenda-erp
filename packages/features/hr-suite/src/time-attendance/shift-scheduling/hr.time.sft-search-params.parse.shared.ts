import {
  hrSftAttendanceReconcileSearchParam,
  hrSftAuditTrailSearchParam,
  hrSftAvailabilitySearchParam,
  hrSftCoverageSearchParam,
  hrSftMyScheduleChangesSearchParam,
  hrSftMySwapsSearchParam,
  hrSftNotificationsSearchParam,
  hrSftPayrollRefsSearchParam,
  hrSftPublicationsSearchParam,
  hrSftRecurrenceRulesSearchParam,
  hrSftReportDefinitionsSearchParam,
  hrSftRosterSearchParam,
  hrSftScheduleChangePendingSearchParam,
  hrSftSwapPendingSearchParam,
  hrSftTemplatesSearchParam,
  HR_SFT_LIST_SEARCH_PARAM_MODEL_FIELDS,
  HR_SFT_LIST_SEARCH_PARAMS_BY_KEY,
  HR_SFT_LIST_SURFACE_COLUMNS_BY_KEY,
  HR_SFT_LIST_SURFACE_KEYS,
  HR_SFT_WORKBENCH_READ_ONLY_SURFACE_KEYS,
  getHrSftArchitectureSurfaceKeys,
  getHrSftListSurfaceKeys,
  type HrSftArchitectureSurfaceKey,
  type HrSftListSurfaceKey,
} from "./hr.time.sft-surface-metadata.shared";

export {
  getHrSftListSurfaceKeys,
  getHrSftArchitectureSurfaceKeys,
  HR_SFT_LIST_SURFACE_KEYS,
  HR_SFT_LIST_SEARCH_PARAMS_BY_KEY,
  HR_SFT_LIST_SEARCH_PARAM_MODEL_FIELDS,
  HR_SFT_LIST_SURFACE_COLUMNS_BY_KEY,
  HR_SFT_WORKBENCH_READ_ONLY_SURFACE_KEYS,
  type HrSftListSurfaceKey,
  type HrSftArchitectureSurfaceKey,
};

export type HrSftSearchParams = {
  templatesSearch?: string;
  rosterSearch?: string;
  recurrenceRulesSearch?: string;
  coverageSearch?: string;
  availabilitySearch?: string;
  myScheduleChangesSearch?: string;
  swapPendingSearch?: string;
  mySwapsSearch?: string;
  scheduleChangePendingSearch?: string;
  publicationsSearch?: string;
  notificationsSearch?: string;
  attendanceReconcileSearch?: string;
  payrollRefsSearch?: string;
  reportDefinitionsSearch?: string;
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

export function parseHrSftSearchParams(
  searchParams?: Record<string, string | string[] | undefined>,
): HrSftSearchParams {
  return {
    templatesSearch: readSearchParam(searchParams, hrSftTemplatesSearchParam),
    rosterSearch: readSearchParam(searchParams, hrSftRosterSearchParam),
    recurrenceRulesSearch: readSearchParam(
      searchParams,
      hrSftRecurrenceRulesSearchParam,
    ),
    coverageSearch: readSearchParam(searchParams, hrSftCoverageSearchParam),
    availabilitySearch: readSearchParam(searchParams, hrSftAvailabilitySearchParam),
    myScheduleChangesSearch: readSearchParam(
      searchParams,
      hrSftMyScheduleChangesSearchParam,
    ),
    swapPendingSearch: readSearchParam(searchParams, hrSftSwapPendingSearchParam),
    mySwapsSearch: readSearchParam(searchParams, hrSftMySwapsSearchParam),
    scheduleChangePendingSearch: readSearchParam(
      searchParams,
      hrSftScheduleChangePendingSearchParam,
    ),
    publicationsSearch: readSearchParam(searchParams, hrSftPublicationsSearchParam),
    notificationsSearch: readSearchParam(searchParams, hrSftNotificationsSearchParam),
    attendanceReconcileSearch: readSearchParam(
      searchParams,
      hrSftAttendanceReconcileSearchParam,
    ),
    payrollRefsSearch: readSearchParam(searchParams, hrSftPayrollRefsSearchParam),
    reportDefinitionsSearch: readSearchParam(
      searchParams,
      hrSftReportDefinitionsSearchParam,
    ),
    auditTrailSearch: readSearchParam(searchParams, hrSftAuditTrailSearchParam),
  };
}

export type HrSftPageModelInput = {
  organizationId: string;
  actorAuthUserId: string;
  accessScope: "self" | "team" | "org";
  canManage: boolean;
  canApprove: boolean;
  actorEmployeeId?: string;
  canViewPayrollRefs: boolean;
  canViewAudit: boolean;
  visibleEmployeeIds: readonly string[] | null;
} & HrSftSearchParams;

export function toHrSftPageModelInput(input: {
  organizationId: string;
  actorAuthUserId: string;
  accessScope: "self" | "team" | "org";
  canManage: boolean;
  canApprove: boolean;
  actorEmployeeId?: string;
  canViewPayrollRefs: boolean;
  canViewAudit: boolean;
  visibleEmployeeIds: readonly string[] | null;
  searchParams?: Record<string, string | string[] | undefined>;
}): HrSftPageModelInput {
  const parsed = parseHrSftSearchParams(input.searchParams);
  return {
    organizationId: input.organizationId,
    actorAuthUserId: input.actorAuthUserId,
    accessScope: input.accessScope,
    canManage: input.canManage,
    canApprove: input.canApprove,
    actorEmployeeId: input.actorEmployeeId,
    canViewPayrollRefs: input.canViewPayrollRefs,
    canViewAudit: input.canViewAudit,
    visibleEmployeeIds: input.visibleEmployeeIds,
    ...parsed,
  };
}

export function defaultSftPeriodRange(): { periodStart: Date; periodEnd: Date } {
  const periodEnd = new Date();
  const periodStart = new Date(periodEnd);
  periodStart.setUTCDate(periodStart.getUTCDate() - 14);
  return { periodStart, periodEnd };
}

export type HrSftSelfServicePageModelInput = {
  organizationId: string;
  actorEmployeeId: string;
  mySwapsSearch?: string;
};

export function toHrSftSelfServicePageModelInput(input: {
  organizationId: string;
  actorEmployeeId: string;
  searchParams?: Record<string, string | string[] | undefined>;
}): HrSftSelfServicePageModelInput {
  return {
    organizationId: input.organizationId,
    actorEmployeeId: input.actorEmployeeId,
    mySwapsSearch: readSearchParam(input.searchParams, hrSftMySwapsSearchParam),
  };
}
