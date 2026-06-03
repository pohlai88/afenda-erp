/** Canonical `erp.hrm.*` audit strings for HRM-GEO-032. */
export const GEO_AUDIT_KEYS = {
  checkinCaptured: "erp.hrm.geo.checkin.captured",
  locationValidated: "erp.hrm.geo.location.validated",
  deviceValidated: "erp.hrm.geo.device.validated",
  exceptionSubmitted: "erp.hrm.geo.exception.submitted",
  exceptionDecided: "erp.hrm.geo.exception.decided",
  outcomeCorrected: "erp.hrm.geo.outcome.corrected",
  lamPublished: "erp.hrm.geo.lam.published",
  payrollPublished: "erp.hrm.geo.payroll.published",
  policyUpdated: "erp.hrm.geo.policy.updated",
  geofenceUpdated: "erp.hrm.geo.geofence.updated",
  deviceRegistered: "erp.hrm.geo.device.registered",
} as const;

export const hrTimeGeoReadPermission = {
  module: "hr",
  object: "geo",
  function: "read",
} as const;

export const hrTimeGeoWritePermission = {
  module: "hr",
  object: "geo",
  function: "update",
} as const;

export const hrTimeGeoLocationDetailReadPermission = {
  module: "hr",
  object: "geo.location",
  function: "read",
} as const;

export const hrGeoGeofencesSurfaceKey = "hr.time.geo.geofences.list";
export const hrGeoPoliciesSurfaceKey = "hr.time.geo.policies.list";
export const hrGeoDevicesSurfaceKey = "hr.time.geo.devices.list";
export const hrGeoPendingSurfaceKey = "hr.time.geo.pending.list";
export const hrGeoHistorySurfaceKey = "hr.time.geo.history.list";
export const hrGeoStatsSurfaceKey = "hr.time.geo.stats";
export const hrGeoAuditTrailSurfaceKey = "hr.time.geo.audit-trail.list";
export const hrGeoLamExposureSurfaceKey = "hr.time.geo.lam-exposure.list";
export const hrGeoOvertimeRefSurfaceKey = "hr.time.geo.overtime-ref.list";
export const hrGeoPayrollRefSurfaceKey = "hr.time.geo.payroll-ref.list";
export const hrGeoRawVsApprovedSurfaceKey = "hr.time.geo.raw-vs-approved.list";
export const hrGeoReportsSurfaceKey = "hr.time.geo.reports.list";

export const hrGeoGeofencesSearchParam = "geoGeofencesSearch";
export const hrGeoPoliciesSearchParam = "geoPoliciesSearch";
export const hrGeoDevicesSearchParam = "geoDevicesSearch";
export const hrGeoPendingSearchParam = "geoPendingSearch";
export const hrGeoHistorySearchParam = "geoHistorySearch";
export const hrGeoReportGroupByParam = "geoReportGroupBy";
export const hrGeoAuditTrailSearchParam = "geoAuditTrailSearch";
export const hrGeoLamExposureSearchParam = "geoLamExposureSearch";
export const hrGeoOvertimeRefSearchParam = "geoOvertimeRefSearch";
export const hrGeoPayrollRefSearchParam = "geoPayrollRefSearch";
export const hrGeoRawVsApprovedSearchParam = "geoRawVsApprovedSearch";

export const hrGeoGeofencesColumnsId = "hr.time.geo.geofences.columns";
export const hrGeoPoliciesColumnsId = "hr.time.geo.policies.columns";
export const hrGeoDevicesColumnsId = "hr.time.geo.devices.columns";
export const hrGeoPendingColumnsId = "hr.time.geo.pending.columns";
export const hrGeoHistoryColumnsId = "hr.time.geo.history.columns";
export const hrGeoReportsColumnsId = "hr.time.geo.reports.columns";
export const hrGeoAuditTrailColumnsId = "hr.time.geo.audit-trail.columns";
export const hrGeoLamExposureColumnsId = "hr.time.geo.lam-exposure.columns";
export const hrGeoOvertimeRefColumnsId = "hr.time.geo.overtime-ref.columns";
export const hrGeoPayrollRefColumnsId = "hr.time.geo.payroll-ref.columns";
export const hrGeoRawVsApprovedColumnsId = "hr.time.geo.raw-vs-approved.columns";
