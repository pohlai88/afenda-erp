export type HrGeoSearchParams = {
  geoGeofencesSearch?: string;
  geoPoliciesSearch?: string;
  geoDevicesSearch?: string;
  geoPendingSearch?: string;
  geoHistorySearch?: string;
  geoReportGroupBy?: string;
  geoAuditTrailSearch?: string;
  geoLamExposureSearch?: string;
  geoOvertimeRefSearch?: string;
  geoPayrollRefSearch?: string;
  geoRawVsApprovedSearch?: string;
};

export type HrGeoPageModelInput = {
  organizationId: string;
  canWriteGeo: boolean;
  canViewDetailedLocation: boolean;
  canReadAudit: boolean;
  visibleEmployeeIds: readonly string[] | null;
  searchParams?: HrGeoSearchParams;
};

export function parseHrGeoSearchParams(
  searchParams?: Record<string, string | string[] | undefined>,
): HrGeoSearchParams {
  const read = (key: string) => {
    const value = searchParams?.[key];
    return typeof value === "string" ? value : undefined;
  };

  return {
    geoGeofencesSearch: read("geoGeofencesSearch"),
    geoPoliciesSearch: read("geoPoliciesSearch"),
    geoDevicesSearch: read("geoDevicesSearch"),
    geoPendingSearch: read("geoPendingSearch"),
    geoHistorySearch: read("geoHistorySearch"),
    geoReportGroupBy: read("geoReportGroupBy"),
    geoAuditTrailSearch: read("geoAuditTrailSearch"),
    geoLamExposureSearch: read("geoLamExposureSearch"),
    geoOvertimeRefSearch: read("geoOvertimeRefSearch"),
    geoPayrollRefSearch: read("geoPayrollRefSearch"),
    geoRawVsApprovedSearch: read("geoRawVsApprovedSearch"),
  };
}

export function toHrGeoPageModelInput(input: {
  organizationId: string;
  canWriteGeo?: boolean;
  canViewDetailedLocation: boolean;
  canReadAudit: boolean;
  visibleEmployeeIds: readonly string[] | null;
  searchParams?: Record<string, string | string[] | undefined>;
}): HrGeoPageModelInput {
  return {
    organizationId: input.organizationId,
    canWriteGeo: input.canWriteGeo ?? false,
    canViewDetailedLocation: input.canViewDetailedLocation,
    canReadAudit: input.canReadAudit,
    visibleEmployeeIds: input.visibleEmployeeIds,
    searchParams: parseHrGeoSearchParams(input.searchParams),
  };
}
