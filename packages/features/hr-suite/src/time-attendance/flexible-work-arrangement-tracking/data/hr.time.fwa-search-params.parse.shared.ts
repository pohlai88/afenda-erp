import {
  HR_FWA_LIST_SEARCH_PARAM_MODEL_FIELDS,
  hrFwaArrangementsSearchParam,
  hrFwaAuditTrailSearchParam,
  hrFwaComplianceSearchParam,
  hrFwaRequestsSearchParam,
} from "../surface/hr.time.fwa-surface-metadata.shared";

export type HrFwaSearchParams = {
  arrangementsSearch?: string;
  requestsSearch?: string;
  complianceSearch?: string;
  auditTrailSearch?: string;
  reportGroupBy?: string;
};

function readParam(
  searchParams: Record<string, string | string[] | undefined> | undefined,
  key: string,
): string | undefined {
  const value = searchParams?.[key];
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export function parseHrFwaSearchParams(
  searchParams?: Record<string, string | string[] | undefined>,
): HrFwaSearchParams {
  return {
    arrangementsSearch: readParam(searchParams, hrFwaArrangementsSearchParam),
    requestsSearch: readParam(searchParams, hrFwaRequestsSearchParam),
    complianceSearch: readParam(searchParams, hrFwaComplianceSearchParam),
    auditTrailSearch: readParam(searchParams, hrFwaAuditTrailSearchParam),
    reportGroupBy: readParam(searchParams, "fwaReportGroupBy"),
  };
}

export function toHrFwaPageModelInput(input: {
  organizationId: string;
  canReadCompliance: boolean;
  canReadAudit: boolean;
  searchParams?: Record<string, string | string[] | undefined>;
  visibleEmployeeIds?: readonly string[] | null;
}) {
  const parsed = parseHrFwaSearchParams(input.searchParams);

  return {
    organizationId: input.organizationId,
    canReadCompliance: input.canReadCompliance,
    canReadAudit: input.canReadAudit,
    visibleEmployeeIds: input.visibleEmployeeIds ?? null,
    arrangementsSearch: parsed.arrangementsSearch,
    requestsSearch: parsed.requestsSearch,
    complianceSearch: parsed.complianceSearch,
    auditTrailSearch: parsed.auditTrailSearch,
    reportGroupBy: parsed.reportGroupBy,
  };
}

export { HR_FWA_LIST_SEARCH_PARAM_MODEL_FIELDS };
