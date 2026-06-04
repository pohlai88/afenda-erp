import { z } from "zod";

import {
  readHrSuiteSearchParam,
  type HrSuiteSearchParamSource,
} from "../../hr-suite-integration/metadata";
import {
  HR_FRM_REPORT_GROUP_BY,
  type HrFrmReportGroupBy,
} from "./hr.industry.frm-constants.shared";

export const hrIndustryFrmReportGroupByParam = "frmReportGroupBy";

export type HrIndustryFrmSearchParams = {
  readonly worksitesSearch?: string;
  readonly assignmentsSearch?: string;
  readonly mobileAttendanceSearch?: string;
  readonly attendanceExceptionsSearch?: string;
  readonly offlineSyncSearch?: string;
  readonly schedulesSearch?: string;
  readonly travelStatusesSearch?: string;
  readonly perDiemRatesSearch?: string;
  readonly perDiemReferencesSearch?: string;
  readonly travelComplianceSearch?: string;
  readonly safetyConfirmationsSearch?: string;
  readonly teamAvailabilitySearch?: string;
  readonly notificationsSearch?: string;
  readonly attendanceExportsSearch?: string;
  readonly overtimeExportsSearch?: string;
  readonly payrollExportsSearch?: string;
  readonly reportsSearch?: string;
  readonly auditTrailSearch?: string;
  readonly reportGroupBy: HrFrmReportGroupBy;
};

export type HrIndustryFrmPageModelInput = {
  readonly organizationId: string;
  readonly visibleEmployeeIds: readonly string[] | null;
  readonly canWrite: boolean;
  readonly canApprove: boolean;
  readonly canReadAudit: boolean;
  readonly canReadRestricted: boolean;
  readonly canExposeIntegrations: boolean;
} & HrIndustryFrmSearchParams;

const reportGroupBySchema = z.enum(HR_FRM_REPORT_GROUP_BY).catch("site");

function readOptionalSearch(
  searchParams: HrSuiteSearchParamSource | undefined,
  key: string,
) {
  return readHrSuiteSearchParam(searchParams, key) || undefined;
}

function isHrIndustryFrmSearchParams(
  value: unknown,
): value is HrIndustryFrmSearchParams {
  return (
    typeof value === "object" &&
    value !== null &&
    "reportGroupBy" in value
  );
}

export function parseHrIndustryFrmSearchParams(
  searchParams?: HrSuiteSearchParamSource,
): HrIndustryFrmSearchParams {
  return {
    worksitesSearch: readOptionalSearch(searchParams, "frmWorksitesSearch"),
    assignmentsSearch: readOptionalSearch(searchParams, "frmAssignmentsSearch"),
    mobileAttendanceSearch: readOptionalSearch(
      searchParams,
      "frmMobileAttendanceSearch",
    ),
    attendanceExceptionsSearch: readOptionalSearch(
      searchParams,
      "frmAttendanceExceptionsSearch",
    ),
    offlineSyncSearch: readOptionalSearch(searchParams, "frmOfflineSyncSearch"),
    schedulesSearch: readOptionalSearch(searchParams, "frmSchedulesSearch"),
    travelStatusesSearch: readOptionalSearch(
      searchParams,
      "frmTravelStatusesSearch",
    ),
    perDiemRatesSearch: readOptionalSearch(searchParams, "frmPerDiemRatesSearch"),
    perDiemReferencesSearch: readOptionalSearch(
      searchParams,
      "frmPerDiemRefsSearch",
    ),
    travelComplianceSearch: readOptionalSearch(
      searchParams,
      "frmTravelComplianceSearch",
    ),
    safetyConfirmationsSearch: readOptionalSearch(
      searchParams,
      "frmSafetySearch",
    ),
    teamAvailabilitySearch: readOptionalSearch(
      searchParams,
      "frmAvailabilitySearch",
    ),
    notificationsSearch: readOptionalSearch(
      searchParams,
      "frmNotificationsSearch",
    ),
    attendanceExportsSearch: readOptionalSearch(
      searchParams,
      "frmAttendanceExportsSearch",
    ),
    overtimeExportsSearch: readOptionalSearch(
      searchParams,
      "frmOvertimeExportsSearch",
    ),
    payrollExportsSearch: readOptionalSearch(
      searchParams,
      "frmPayrollExportsSearch",
    ),
    reportsSearch: readOptionalSearch(searchParams, "frmReportsSearch"),
    auditTrailSearch: readOptionalSearch(searchParams, "frmAuditTrailSearch"),
    reportGroupBy: reportGroupBySchema.parse(
      readHrSuiteSearchParam(searchParams, hrIndustryFrmReportGroupByParam),
    ),
  };
}

export function toHrIndustryFrmPageModelInput(input: {
  readonly organizationId: string;
  readonly visibleEmployeeIds?: readonly string[] | null;
  readonly canWrite: boolean;
  readonly canApprove: boolean;
  readonly canReadAudit: boolean;
  readonly canReadRestricted: boolean;
  readonly canExposeIntegrations: boolean;
  readonly searchParams?: HrSuiteSearchParamSource | HrIndustryFrmSearchParams;
}): HrIndustryFrmPageModelInput {
  const parsed = isHrIndustryFrmSearchParams(input.searchParams)
    ? input.searchParams
    : parseHrIndustryFrmSearchParams(input.searchParams);

  return {
    organizationId: input.organizationId,
    visibleEmployeeIds: input.visibleEmployeeIds ?? null,
    canWrite: input.canWrite,
    canApprove: input.canApprove,
    canReadAudit: input.canReadAudit,
    canReadRestricted: input.canReadRestricted,
    canExposeIntegrations: input.canExposeIntegrations,
    ...parsed,
  };
}
