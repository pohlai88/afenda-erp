import { z } from "zod";

import {
  readHrSuiteSearchParam,
  type HrSuiteSearchParamSource,
} from "../../hr-suite-integration/metadata";
import {
  HR_MSC_REPORT_GROUP_BY,
  HR_MSC_STATUS_FILTERS,
  type HrMscReportGroupBy,
  type HrMscStatusFilter,
} from "./hr.industry.msc-constants.shared";

export const hrIndustryMscReportGroupByParam = "mscReportGroupBy";
export const hrIndustryMscStatusParam = "mscStatus";

export type HrIndustryMscStatusFilter = HrMscStatusFilter;

export type HrIndustryMscSearchParams = {
  readonly requirementsSearch?: string;
  readonly employeeObligationsSearch?: string;
  readonly trainingAssignmentsSearch?: string;
  readonly certificationsSearch?: string;
  readonly workRestrictionsSearch?: string;
  readonly hazardAssessmentsSearch?: string;
  readonly incidentsSearch?: string;
  readonly correctiveActionsSearch?: string;
  readonly notificationsSearch?: string;
  readonly evidenceLinksSearch?: string;
  readonly reportsSearch?: string;
  readonly integrationExposuresSearch?: string;
  readonly auditTrailSearch?: string;
  readonly reportGroupBy: HrMscReportGroupBy;
  readonly status: HrMscStatusFilter;
};

export type HrIndustryMscPageModelInput = {
  readonly organizationId: string;
  readonly visibleEmployeeIds: readonly string[] | null;
  readonly canWrite: boolean;
  readonly canApprove: boolean;
  readonly canReadAudit: boolean;
  readonly canReadRestricted: boolean;
  readonly canExposeIntegrations: boolean;
} & HrIndustryMscSearchParams;

const reportGroupBySchema = z.enum(HR_MSC_REPORT_GROUP_BY).catch("site");
const statusFilterSchema = z.enum(HR_MSC_STATUS_FILTERS).catch("all");

function readOptionalSearch(
  searchParams: HrSuiteSearchParamSource | undefined,
  key: string,
) {
  return readHrSuiteSearchParam(searchParams, key) || undefined;
}

function isHrIndustryMscSearchParams(
  value: unknown,
): value is HrIndustryMscSearchParams {
  return (
    typeof value === "object" &&
    value !== null &&
    "reportGroupBy" in value &&
    "status" in value
  );
}

export function parseHrIndustryMscSearchParams(
  searchParams?: HrSuiteSearchParamSource,
): HrIndustryMscSearchParams {
  return {
    requirementsSearch: readOptionalSearch(searchParams, "mscRequirementsSearch"),
    employeeObligationsSearch: readOptionalSearch(
      searchParams,
      "mscEmployeeObligationsSearch",
    ),
    trainingAssignmentsSearch: readOptionalSearch(
      searchParams,
      "mscTrainingAssignmentsSearch",
    ),
    certificationsSearch: readOptionalSearch(
      searchParams,
      "mscCertificationsSearch",
    ),
    workRestrictionsSearch: readOptionalSearch(
      searchParams,
      "mscWorkRestrictionsSearch",
    ),
    hazardAssessmentsSearch: readOptionalSearch(
      searchParams,
      "mscHazardAssessmentsSearch",
    ),
    incidentsSearch: readOptionalSearch(searchParams, "mscIncidentsSearch"),
    correctiveActionsSearch: readOptionalSearch(
      searchParams,
      "mscCorrectiveActionsSearch",
    ),
    notificationsSearch: readOptionalSearch(
      searchParams,
      "mscNotificationsSearch",
    ),
    evidenceLinksSearch: readOptionalSearch(
      searchParams,
      "mscEvidenceLinksSearch",
    ),
    reportsSearch: readOptionalSearch(searchParams, "mscReportsSearch"),
    integrationExposuresSearch: readOptionalSearch(
      searchParams,
      "mscIntegrationsSearch",
    ),
    auditTrailSearch: readOptionalSearch(searchParams, "mscAuditTrailSearch"),
    reportGroupBy: reportGroupBySchema.parse(
      readHrSuiteSearchParam(searchParams, hrIndustryMscReportGroupByParam),
    ),
    status: statusFilterSchema.parse(
      readHrSuiteSearchParam(searchParams, hrIndustryMscStatusParam),
    ),
  };
}

export function toHrIndustryMscPageModelInput(input: {
  readonly organizationId: string;
  readonly visibleEmployeeIds?: readonly string[] | null;
  readonly canWrite: boolean;
  readonly canApprove: boolean;
  readonly canReadAudit: boolean;
  readonly canReadRestricted: boolean;
  readonly canExposeIntegrations: boolean;
  readonly searchParams?: HrSuiteSearchParamSource | HrIndustryMscSearchParams;
}): HrIndustryMscPageModelInput {
  const parsed: HrIndustryMscSearchParams = isHrIndustryMscSearchParams(
    input.searchParams,
  )
    ? input.searchParams
    : parseHrIndustryMscSearchParams(input.searchParams);

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
