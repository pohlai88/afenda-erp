import {
  hrGeoAuditTrailSearchParam,
  hrGeoAuditTrailSurfaceKey,
  hrGeoDevicesColumnsId,
  hrGeoDevicesSearchParam,
  hrGeoDevicesSurfaceKey,
  hrGeoGeofencesColumnsId,
  hrGeoGeofencesSearchParam,
  hrGeoGeofencesSurfaceKey,
  hrGeoHistoryColumnsId,
  hrGeoHistorySearchParam,
  hrGeoHistorySurfaceKey,
  hrGeoLamExposureColumnsId,
  hrGeoLamExposureSearchParam,
  hrGeoLamExposureSurfaceKey,
  hrGeoOvertimeRefColumnsId,
  hrGeoOvertimeRefSearchParam,
  hrGeoOvertimeRefSurfaceKey,
  hrGeoPayrollRefColumnsId,
  hrGeoPayrollRefSearchParam,
  hrGeoPayrollRefSurfaceKey,
  hrGeoPendingColumnsId,
  hrGeoPendingSearchParam,
  hrGeoPendingSurfaceKey,
  hrGeoPoliciesColumnsId,
  hrGeoPoliciesSearchParam,
  hrGeoPoliciesSurfaceKey,
  hrGeoRawVsApprovedColumnsId,
  hrGeoRawVsApprovedSearchParam,
  hrGeoRawVsApprovedSurfaceKey,
  hrGeoReportsSurfaceKey,
  hrGeoReportGroupByParam,
  hrGeoReportsColumnsId,
  hrGeoAuditTrailColumnsId,
  hrGeoStatsSurfaceKey,
} from "../contracts/geolocation.contract";

export {
  hrGeoGeofencesSurfaceKey,
  hrGeoPoliciesSurfaceKey,
  hrGeoDevicesSurfaceKey,
  hrGeoPendingSurfaceKey,
  hrGeoHistorySurfaceKey,
  hrGeoStatsSurfaceKey,
  hrGeoAuditTrailSurfaceKey,
  hrGeoLamExposureSurfaceKey,
  hrGeoOvertimeRefSurfaceKey,
  hrGeoPayrollRefSurfaceKey,
  hrGeoRawVsApprovedSurfaceKey,
  hrGeoReportsSurfaceKey,
  hrGeoGeofencesSearchParam,
  hrGeoPoliciesSearchParam,
  hrGeoDevicesSearchParam,
  hrGeoPendingSearchParam,
  hrGeoHistorySearchParam,
  hrGeoReportGroupByParam,
  hrGeoAuditTrailSearchParam,
  hrGeoLamExposureSearchParam,
  hrGeoOvertimeRefSearchParam,
  hrGeoPayrollRefSearchParam,
  hrGeoRawVsApprovedSearchParam,
};

export const HR_GEO_LIST_SURFACE_KEYS = [
  hrGeoGeofencesSurfaceKey,
  hrGeoPoliciesSurfaceKey,
  hrGeoDevicesSurfaceKey,
  hrGeoPendingSurfaceKey,
  hrGeoHistorySurfaceKey,
  hrGeoRawVsApprovedSurfaceKey,
  hrGeoLamExposureSurfaceKey,
  hrGeoOvertimeRefSurfaceKey,
  hrGeoPayrollRefSurfaceKey,
  hrGeoAuditTrailSurfaceKey,
] as const;

export type HrGeoListSurfaceKey = (typeof HR_GEO_LIST_SURFACE_KEYS)[number];

export const HR_GEO_LIST_SURFACE_COLUMNS_BY_KEY = {
  [hrGeoGeofencesSurfaceKey]: hrGeoGeofencesColumnsId,
  [hrGeoPoliciesSurfaceKey]: hrGeoPoliciesColumnsId,
  [hrGeoDevicesSurfaceKey]: hrGeoDevicesColumnsId,
  [hrGeoPendingSurfaceKey]: hrGeoPendingColumnsId,
  [hrGeoHistorySurfaceKey]: hrGeoHistoryColumnsId,
  [hrGeoRawVsApprovedSurfaceKey]: hrGeoRawVsApprovedColumnsId,
  [hrGeoLamExposureSurfaceKey]: hrGeoLamExposureColumnsId,
  [hrGeoOvertimeRefSurfaceKey]: hrGeoOvertimeRefColumnsId,
  [hrGeoPayrollRefSurfaceKey]: hrGeoPayrollRefColumnsId,
  [hrGeoAuditTrailSurfaceKey]: hrGeoAuditTrailColumnsId,
} as const;

export const HR_GEO_LIST_SEARCH_PARAMS_BY_KEY = {
  [hrGeoGeofencesSurfaceKey]: hrGeoGeofencesSearchParam,
  [hrGeoPoliciesSurfaceKey]: hrGeoPoliciesSearchParam,
  [hrGeoDevicesSurfaceKey]: hrGeoDevicesSearchParam,
  [hrGeoPendingSurfaceKey]: hrGeoPendingSearchParam,
  [hrGeoHistorySurfaceKey]: hrGeoHistorySearchParam,
  [hrGeoRawVsApprovedSurfaceKey]: hrGeoRawVsApprovedSearchParam,
  [hrGeoLamExposureSurfaceKey]: hrGeoLamExposureSearchParam,
  [hrGeoOvertimeRefSurfaceKey]: hrGeoOvertimeRefSearchParam,
  [hrGeoPayrollRefSurfaceKey]: hrGeoPayrollRefSearchParam,
  [hrGeoAuditTrailSurfaceKey]: hrGeoAuditTrailSearchParam,
} as const;

export const HR_GEO_LIST_SEARCH_PARAM_MODEL_FIELDS = [
  hrGeoGeofencesSearchParam,
  hrGeoPoliciesSearchParam,
  hrGeoDevicesSearchParam,
  hrGeoPendingSearchParam,
  hrGeoHistorySearchParam,
  hrGeoReportGroupByParam,
  hrGeoRawVsApprovedSearchParam,
  hrGeoLamExposureSearchParam,
  hrGeoOvertimeRefSearchParam,
  hrGeoPayrollRefSearchParam,
  hrGeoAuditTrailSearchParam,
] as const;

export function getHrGeoListSurfaceKeys(): readonly HrGeoListSurfaceKey[] {
  return HR_GEO_LIST_SURFACE_KEYS;
}

export { hrGeoReportsColumnsId };
