import { z } from "zod";

import {
  readHrSuiteSearchParam,
  type HrSuiteSearchParamSource,
} from "../../hr-suite-integration/metadata";
import {
  HR_WORKFORCE_ESS_REPORT_GROUP_BY,
  HR_WORKFORCE_ESS_STATUS_FILTERS,
  type HrWorkforceEssReportGroupBy,
  type HrWorkforceEssStatusFilter,
} from "./hr.workforce.ess-constants.shared";

export const hrWorkforceEssReportGroupByParam =
  "hrWorkforceEssReportGroupBy";
export const hrWorkforceEssStatusParam = "hrWorkforceEssStatus";

export type HrWorkforceEssSearchParams = {
  readonly profileSearch?: string;
  readonly profileUpdatesSearch?: string;
  readonly leaveBalancesSearch?: string;
  readonly leaveRequestsSearch?: string;
  readonly payDocumentsSearch?: string;
  readonly attendanceSearch?: string;
  readonly shiftSchedulesSearch?: string;
  readonly claimsSearch?: string;
  readonly documentsSearch?: string;
  readonly resourcesSearch?: string;
  readonly acknowledgementsSearch?: string;
  readonly tasksSearch?: string;
  readonly requestTrackerSearch?: string;
  readonly notificationsSearch?: string;
  readonly approvalsSearch?: string;
  readonly benefitsSearch?: string;
  readonly trainingSearch?: string;
  readonly onboardingSearch?: string;
  readonly offboardingSearch?: string;
  readonly consentSearch?: string;
  readonly accessLogSearch?: string;
  readonly reportsSearch?: string;
  readonly auditTrailSearch?: string;
  readonly reportGroupBy: HrWorkforceEssReportGroupBy;
  readonly status: HrWorkforceEssStatusFilter;
};

export type HrWorkforceEssPageModelInput = {
  readonly organizationId: string;
  readonly visibleEmployeeIds?: readonly string[] | null;
  readonly actorUserId?: string;
  readonly canWrite: boolean;
  readonly canApprove: boolean;
  readonly canReadAudit: boolean;
  readonly canReadRestricted: boolean;
  readonly canExposeIntegrations: boolean;
} & HrWorkforceEssSearchParams;

const reportGroupBySchema = z
  .enum(HR_WORKFORCE_ESS_REPORT_GROUP_BY)
  .catch("status");
const statusFilterSchema = z
  .enum(HR_WORKFORCE_ESS_STATUS_FILTERS)
  .catch("all");

function readOptionalSearch(
  searchParams: HrSuiteSearchParamSource | undefined,
  key: string,
) {
  return readHrSuiteSearchParam(searchParams, key) || undefined;
}

function isHrWorkforceEssSearchParams(
  value: unknown,
): value is HrWorkforceEssSearchParams {
  return (
    typeof value === "object" &&
    value !== null &&
    "reportGroupBy" in value &&
    "status" in value
  );
}

export function parseHrWorkforceEssSearchParams(
  searchParams?: HrSuiteSearchParamSource,
): HrWorkforceEssSearchParams {
  return {
    profileSearch: readOptionalSearch(
      searchParams,
      "hrWorkforceEssProfileSearch",
    ),
    profileUpdatesSearch: readOptionalSearch(
      searchParams,
      "hrWorkforceEssProfileUpdatesSearch",
    ),
    leaveBalancesSearch: readOptionalSearch(
      searchParams,
      "hrWorkforceEssLeaveBalancesSearch",
    ),
    leaveRequestsSearch: readOptionalSearch(
      searchParams,
      "hrWorkforceEssLeaveRequestsSearch",
    ),
    payDocumentsSearch: readOptionalSearch(
      searchParams,
      "hrWorkforceEssPayDocumentsSearch",
    ),
    attendanceSearch: readOptionalSearch(
      searchParams,
      "hrWorkforceEssAttendanceSearch",
    ),
    shiftSchedulesSearch: readOptionalSearch(
      searchParams,
      "hrWorkforceEssShiftSchedulesSearch",
    ),
    claimsSearch: readOptionalSearch(searchParams, "hrWorkforceEssClaimsSearch"),
    documentsSearch: readOptionalSearch(
      searchParams,
      "hrWorkforceEssDocumentsSearch",
    ),
    resourcesSearch: readOptionalSearch(
      searchParams,
      "hrWorkforceEssResourcesSearch",
    ),
    acknowledgementsSearch: readOptionalSearch(
      searchParams,
      "hrWorkforceEssAcknowledgementsSearch",
    ),
    tasksSearch: readOptionalSearch(searchParams, "hrWorkforceEssTasksSearch"),
    requestTrackerSearch: readOptionalSearch(
      searchParams,
      "hrWorkforceEssRequestTrackerSearch",
    ),
    notificationsSearch: readOptionalSearch(
      searchParams,
      "hrWorkforceEssNotificationsSearch",
    ),
    approvalsSearch: readOptionalSearch(
      searchParams,
      "hrWorkforceEssApprovalsSearch",
    ),
    benefitsSearch: readOptionalSearch(
      searchParams,
      "hrWorkforceEssBenefitsSearch",
    ),
    trainingSearch: readOptionalSearch(
      searchParams,
      "hrWorkforceEssTrainingSearch",
    ),
    onboardingSearch: readOptionalSearch(
      searchParams,
      "hrWorkforceEssOnboardingSearch",
    ),
    offboardingSearch: readOptionalSearch(
      searchParams,
      "hrWorkforceEssOffboardingSearch",
    ),
    consentSearch: readOptionalSearch(
      searchParams,
      "hrWorkforceEssConsentSearch",
    ),
    accessLogSearch: readOptionalSearch(
      searchParams,
      "hrWorkforceEssAccessLogSearch",
    ),
    reportsSearch: readOptionalSearch(searchParams, "hrWorkforceEssReportsSearch"),
    auditTrailSearch: readOptionalSearch(
      searchParams,
      "hrWorkforceEssAuditTrailSearch",
    ),
    reportGroupBy: reportGroupBySchema.parse(
      readHrSuiteSearchParam(searchParams, hrWorkforceEssReportGroupByParam),
    ),
    status: statusFilterSchema.parse(
      readHrSuiteSearchParam(searchParams, hrWorkforceEssStatusParam),
    ),
  };
}

export function toHrWorkforceEssPageModelInput(input: {
  readonly organizationId: string;
  readonly visibleEmployeeIds?: readonly string[] | null;
  readonly actorUserId?: string;
  readonly canWrite?: boolean;
  readonly canApprove?: boolean;
  readonly canReadAudit?: boolean;
  readonly canReadRestricted?: boolean;
  readonly canExposeIntegrations?: boolean;
  readonly searchParams?: HrSuiteSearchParamSource | HrWorkforceEssSearchParams;
}): HrWorkforceEssPageModelInput {
  const parsed: HrWorkforceEssSearchParams = isHrWorkforceEssSearchParams(
    input.searchParams,
  )
    ? input.searchParams
    : parseHrWorkforceEssSearchParams(input.searchParams);

  return {
    organizationId: input.organizationId,
    visibleEmployeeIds: input.visibleEmployeeIds ?? null,
    actorUserId: input.actorUserId,
    canWrite: input.canWrite ?? false,
    canApprove: input.canApprove ?? false,
    canReadAudit: input.canReadAudit ?? false,
    canReadRestricted: input.canReadRestricted ?? false,
    canExposeIntegrations: input.canExposeIntegrations ?? false,
    ...parsed,
  };
}
