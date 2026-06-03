export const hrFwaArrangementsColumnsId = "hr.time.fwa.arrangements.columns";
export const hrFwaRequestsColumnsId = "hr.time.fwa.requests.columns";
export const hrFwaComplianceColumnsId = "hr.time.fwa.compliance.columns";
export const hrFwaReportsColumnsId = "hr.time.fwa.reports.columns";
export const hrFwaAuditTrailColumnsId = "hr.time.fwa.audit-trail.columns";

export const hrFwaArrangementsSurfaceKey = "hr.time.fwa.arrangements.list";
export const hrFwaRequestsSurfaceKey = "hr.time.fwa.requests.list";
export const hrFwaComplianceSurfaceKey = "hr.time.fwa.compliance.list";
export const hrFwaReportsSurfaceKey = "hr.time.fwa.reports.list";
export const hrFwaAuditTrailSurfaceKey = "hr.time.fwa.audit-trail.list";

export const hrFwaArrangementsSearchParam = "fwaArrangementsSearch";
export const hrFwaRequestsSearchParam = "fwaRequestsSearch";
export const hrFwaComplianceSearchParam = "fwaComplianceSearch";
export const hrFwaAuditTrailSearchParam = "fwaAuditTrailSearch";

export const HR_FWA_LIST_SURFACE_KEYS = [
  hrFwaArrangementsSurfaceKey,
  hrFwaRequestsSurfaceKey,
  hrFwaComplianceSurfaceKey,
  hrFwaReportsSurfaceKey,
  hrFwaAuditTrailSurfaceKey,
] as const;

export type HrFwaListSurfaceKey = (typeof HR_FWA_LIST_SURFACE_KEYS)[number];

export const HR_FWA_LIST_SEARCH_PARAMS_BY_KEY = {
  [hrFwaArrangementsSurfaceKey]: hrFwaArrangementsSearchParam,
  [hrFwaRequestsSurfaceKey]: hrFwaRequestsSearchParam,
  [hrFwaComplianceSurfaceKey]: hrFwaComplianceSearchParam,
  [hrFwaAuditTrailSurfaceKey]: hrFwaAuditTrailSearchParam,
} as const;

export const HR_FWA_LIST_SEARCH_PARAM_MODEL_FIELDS = {
  [hrFwaArrangementsSearchParam]: "arrangementsSearch",
  [hrFwaRequestsSearchParam]: "requestsSearch",
  [hrFwaComplianceSearchParam]: "complianceSearch",
  [hrFwaAuditTrailSearchParam]: "auditTrailSearch",
} as const;

export const HR_FWA_LIST_SURFACE_COLUMNS_BY_KEY = {
  [hrFwaArrangementsSurfaceKey]: hrFwaArrangementsColumnsId,
  [hrFwaRequestsSurfaceKey]: hrFwaRequestsColumnsId,
  [hrFwaComplianceSurfaceKey]: hrFwaComplianceColumnsId,
  [hrFwaReportsSurfaceKey]: hrFwaReportsColumnsId,
  [hrFwaAuditTrailSurfaceKey]: hrFwaAuditTrailColumnsId,
} as const;

export function getHrFwaListSurfaceKeys(): readonly HrFwaListSurfaceKey[] {
  return HR_FWA_LIST_SURFACE_KEYS;
}
