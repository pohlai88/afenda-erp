import {
  HR_TIME_CLOCK_LIST_SEARCH_PARAM_MODEL_FIELDS,
  HR_TIME_CLOCK_SEARCH_PARAM_TO_PAGE_MODEL_FIELD,
} from "./hr.time.clock-integration-surface-metadata.shared";

export {
  HR_TIME_CLOCK_LIST_SEARCH_PARAM_MODEL_FIELDS,
  HR_TIME_CLOCK_SEARCH_PARAM_TO_PAGE_MODEL_FIELD,
};

export type HrTimeClockSearchParams = {
  devicesSearch?: string;
  mappingsSearch?: string;
  rawPunchesSearch?: string;
  punchExceptionsSearch?: string;
  syncBatchesSearch?: string;
  lamExportSearch?: string;
  overtimeRefsSearch?: string;
  payrollRefsSearch?: string;
  auditTrailSearch?: string;
  reportGroupBy?: string;
  search?: string;
};

export type HrTimeClockPageModelInput = HrTimeClockSearchParams & {
  organizationId: string;
  canWrite: boolean;
  canAdmin: boolean;
  canReadAudit?: boolean;
};

function readSearchParam(
  searchParams: Record<string, string | string[] | undefined> | undefined,
  key: string,
): string | undefined {
  const value = searchParams?.[key];
  return typeof value === "string" ? value.trim() || undefined : undefined;
}

export function parseHrTimeClockSearchParams(
  searchParams?: Record<string, string | string[] | undefined>,
): HrTimeClockSearchParams {
  const shared =
    readSearchParam(searchParams, "search") ??
    readSearchParam(searchParams, "timeClockSearch");

  const read = (key: string) => readSearchParam(searchParams, key) ?? shared;

  return {
    devicesSearch: read("timeClockDevicesSearch"),
    mappingsSearch: read("timeClockEmployeeMappingsSearch"),
    rawPunchesSearch: read("timeClockRawPunchesSearch"),
    punchExceptionsSearch: read("timeClockPunchExceptionsSearch"),
    syncBatchesSearch: read("timeClockSyncBatchesSearch"),
    lamExportSearch: read("timeClockLamExportSearch"),
    overtimeRefsSearch: read("timeClockOvertimeRefsSearch"),
    payrollRefsSearch: read("timeClockPayrollRefsSearch"),
    auditTrailSearch: read("timeClockAuditTrailSearch"),
    reportGroupBy: readSearchParam(searchParams, "timeClockReportGroupBy"),
    search: shared,
  };
}

export function toHrTimeClockPageModelInput(input: {
  organizationId: string;
  canWrite: boolean;
  canAdmin: boolean;
  canReadAudit?: boolean;
  searchParams?: Record<string, string | string[] | undefined>;
}): HrTimeClockPageModelInput {
  return {
    organizationId: input.organizationId,
    canWrite: input.canWrite,
    canAdmin: input.canAdmin,
    canReadAudit: input.canReadAudit ?? true,
    ...parseHrTimeClockSearchParams(input.searchParams),
  };
}
