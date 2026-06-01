import { z } from "zod";

import {
  readHrSuiteSearchParam,
  type HrSuiteSearchParamSource,
} from "../../../hr-suite-integration/metadata";
import {
  HR_RWS_REPORT_GROUP_BY,
  HR_RWS_STATUS_FILTERS,
  type HrRwsReportGroupBy,
  type HrRwsStatusFilter,
} from "../schemas/hr.industry.rws-constants.shared";

export const hrIndustryRwsReportGroupByParam = "rwsReportGroupBy";
export const hrIndustryRwsStatusParam = "rwsStatus";

export type HrIndustryRwsStatusFilter = HrRwsStatusFilter;

export type HrIndustryRwsSearchParams = {
  readonly schedulesSearch?: string;
  readonly assignmentsSearch?: string;
  readonly availabilitySearch?: string;
  readonly coverageSearch?: string;
  readonly openShiftsSearch?: string;
  readonly shiftSwapsSearch?: string;
  readonly demandReferencesSearch?: string;
  readonly laborBudgetsSearch?: string;
  readonly complianceFindingsSearch?: string;
  readonly notificationsSearch?: string;
  readonly attendanceComparisonSearch?: string;
  readonly payrollReferencesSearch?: string;
  readonly reportsSearch?: string;
  readonly integrationExposuresSearch?: string;
  readonly auditTrailSearch?: string;
  readonly reportGroupBy: HrRwsReportGroupBy;
  readonly status: HrRwsStatusFilter;
};

export type HrIndustryRwsPageModelInput = {
  readonly organizationId: string;
  readonly visibleEmployeeIds: readonly string[] | null;
  readonly canWrite: boolean;
  readonly canApprove: boolean;
  readonly canReadAudit: boolean;
  readonly canReadRestricted: boolean;
  readonly canReadLaborCost: boolean;
  readonly canExposeIntegrations: boolean;
} & HrIndustryRwsSearchParams;

const reportGroupBySchema = z.enum(HR_RWS_REPORT_GROUP_BY).catch("store");
const statusFilterSchema = z.enum(HR_RWS_STATUS_FILTERS).catch("all");

function readOptionalSearch(
  searchParams: HrSuiteSearchParamSource | undefined,
  key: string,
) {
  return readHrSuiteSearchParam(searchParams, key) || undefined;
}

function isHrIndustryRwsSearchParams(
  value: unknown,
): value is HrIndustryRwsSearchParams {
  return (
    typeof value === "object" &&
    value !== null &&
    "reportGroupBy" in value &&
    "status" in value
  );
}

export function parseHrIndustryRwsSearchParams(
  searchParams?: HrSuiteSearchParamSource,
): HrIndustryRwsSearchParams {
  return {
    schedulesSearch: readOptionalSearch(searchParams, "rwsSchedulesSearch"),
    assignmentsSearch: readOptionalSearch(searchParams, "rwsAssignmentsSearch"),
    availabilitySearch: readOptionalSearch(searchParams, "rwsAvailabilitySearch"),
    coverageSearch: readOptionalSearch(searchParams, "rwsCoverageSearch"),
    openShiftsSearch: readOptionalSearch(searchParams, "rwsOpenShiftsSearch"),
    shiftSwapsSearch: readOptionalSearch(searchParams, "rwsShiftSwapsSearch"),
    demandReferencesSearch: readOptionalSearch(searchParams, "rwsDemandSearch"),
    laborBudgetsSearch: readOptionalSearch(
      searchParams,
      "rwsLaborBudgetsSearch",
    ),
    complianceFindingsSearch: readOptionalSearch(
      searchParams,
      "rwsComplianceSearch",
    ),
    notificationsSearch: readOptionalSearch(
      searchParams,
      "rwsNotificationsSearch",
    ),
    attendanceComparisonSearch: readOptionalSearch(
      searchParams,
      "rwsAttendanceSearch",
    ),
    payrollReferencesSearch: readOptionalSearch(searchParams, "rwsPayrollSearch"),
    reportsSearch: readOptionalSearch(searchParams, "rwsReportsSearch"),
    integrationExposuresSearch: readOptionalSearch(
      searchParams,
      "rwsIntegrationsSearch",
    ),
    auditTrailSearch: readOptionalSearch(searchParams, "rwsAuditTrailSearch"),
    reportGroupBy: reportGroupBySchema.parse(
      readHrSuiteSearchParam(searchParams, hrIndustryRwsReportGroupByParam),
    ),
    status: statusFilterSchema.parse(
      readHrSuiteSearchParam(searchParams, hrIndustryRwsStatusParam),
    ),
  };
}

export function toHrIndustryRwsPageModelInput(input: {
  readonly organizationId: string;
  readonly visibleEmployeeIds?: readonly string[] | null;
  readonly canWrite: boolean;
  readonly canApprove: boolean;
  readonly canReadAudit: boolean;
  readonly canReadRestricted: boolean;
  readonly canReadLaborCost: boolean;
  readonly canExposeIntegrations: boolean;
  readonly searchParams?: HrSuiteSearchParamSource | HrIndustryRwsSearchParams;
}): HrIndustryRwsPageModelInput {
  const parsed: HrIndustryRwsSearchParams = isHrIndustryRwsSearchParams(
    input.searchParams,
  )
    ? input.searchParams
    : parseHrIndustryRwsSearchParams(input.searchParams);

  return {
    organizationId: input.organizationId,
    visibleEmployeeIds: input.visibleEmployeeIds ?? null,
    canWrite: input.canWrite,
    canApprove: input.canApprove,
    canReadAudit: input.canReadAudit,
    canReadRestricted: input.canReadRestricted,
    canReadLaborCost: input.canReadLaborCost,
    canExposeIntegrations: input.canExposeIntegrations,
    ...parsed,
  };
}
