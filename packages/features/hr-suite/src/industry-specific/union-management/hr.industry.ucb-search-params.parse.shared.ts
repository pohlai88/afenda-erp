import { z } from "zod";

import {
  readHrSuiteSearchParam,
  type HrSuiteSearchParamSource,
} from "../../employee-management/compliance-regulatory-tracking/metadata";
import {
  HR_UCB_REPORT_GROUP_BY,
  HR_UCB_STATUS_FILTERS,
  type HrUcbReportGroupBy,
  type HrUcbStatusFilter,
} from "./hr.industry.ucb-constants.shared";

export const hrIndustryUcbReportGroupByParam = "ucbReportGroupBy";
export const hrIndustryUcbStatusParam = "ucbStatus";

export type HrIndustryUcbStatusFilter = HrUcbStatusFilter;

export type HrIndustryUcbSearchParams = {
  readonly unionsSearch?: string;
  readonly agreementsSearch?: string;
  readonly assignmentsSearch?: string;
  readonly membershipsSearch?: string;
  readonly ruleReferencesSearch?: string;
  readonly senioritySearch?: string;
  readonly ruleConflictsSearch?: string;
  readonly duesReferencesSearch?: string;
  readonly grievancesSearch?: string;
  readonly disputesSearch?: string;
  readonly representativesSearch?: string;
  readonly laborMeetingsSearch?: string;
  readonly alertsSearch?: string;
  readonly reportsSearch?: string;
  readonly integrationExposuresSearch?: string;
  readonly auditTrailSearch?: string;
  readonly reportGroupBy: HrUcbReportGroupBy;
  readonly status: HrUcbStatusFilter;
};

export type HrIndustryUcbPageModelInput = {
  readonly organizationId: string;
  readonly visibleEmployeeIds: readonly string[] | null;
  readonly canWrite: boolean;
  readonly canApprove: boolean;
  readonly canReadAudit: boolean;
  readonly canReadRestricted: boolean;
  readonly canManageGrievances: boolean;
  readonly canReadLegalReferences: boolean;
  readonly canExposePayroll: boolean;
  readonly canExposeIntegrations: boolean;
  readonly canExportReports: boolean;
} & HrIndustryUcbSearchParams;

const reportGroupBySchema = z.enum(HR_UCB_REPORT_GROUP_BY).catch("union");
const statusFilterSchema = z.enum(HR_UCB_STATUS_FILTERS).catch("all");

function readOptionalSearch(
  searchParams: HrSuiteSearchParamSource | undefined,
  key: string,
) {
  return readHrSuiteSearchParam(searchParams, key) || undefined;
}

function isHrIndustryUcbSearchParams(
  value: unknown,
): value is HrIndustryUcbSearchParams {
  return (
    typeof value === "object" &&
    value !== null &&
    "reportGroupBy" in value &&
    "status" in value
  );
}

export function parseHrIndustryUcbSearchParams(
  searchParams?: HrSuiteSearchParamSource,
): HrIndustryUcbSearchParams {
  return {
    unionsSearch: readOptionalSearch(searchParams, "ucbUnionsSearch"),
    agreementsSearch: readOptionalSearch(searchParams, "ucbAgreementsSearch"),
    assignmentsSearch: readOptionalSearch(searchParams, "ucbAssignmentsSearch"),
    membershipsSearch: readOptionalSearch(searchParams, "ucbMembershipsSearch"),
    ruleReferencesSearch: readOptionalSearch(
      searchParams,
      "ucbRuleReferencesSearch",
    ),
    senioritySearch: readOptionalSearch(searchParams, "ucbSenioritySearch"),
    ruleConflictsSearch: readOptionalSearch(
      searchParams,
      "ucbRuleConflictsSearch",
    ),
    duesReferencesSearch: readOptionalSearch(
      searchParams,
      "ucbDuesReferencesSearch",
    ),
    grievancesSearch: readOptionalSearch(searchParams, "ucbGrievancesSearch"),
    disputesSearch: readOptionalSearch(searchParams, "ucbDisputesSearch"),
    representativesSearch: readOptionalSearch(
      searchParams,
      "ucbRepresentativesSearch",
    ),
    laborMeetingsSearch: readOptionalSearch(
      searchParams,
      "ucbLaborMeetingsSearch",
    ),
    alertsSearch: readOptionalSearch(searchParams, "ucbAlertsSearch"),
    reportsSearch: readOptionalSearch(searchParams, "ucbReportsSearch"),
    integrationExposuresSearch: readOptionalSearch(
      searchParams,
      "ucbIntegrationsSearch",
    ),
    auditTrailSearch: readOptionalSearch(searchParams, "ucbAuditTrailSearch"),
    reportGroupBy: reportGroupBySchema.parse(
      readHrSuiteSearchParam(searchParams, hrIndustryUcbReportGroupByParam),
    ),
    status: statusFilterSchema.parse(
      readHrSuiteSearchParam(searchParams, hrIndustryUcbStatusParam),
    ),
  };
}

export function toHrIndustryUcbPageModelInput(input: {
  readonly organizationId: string;
  readonly visibleEmployeeIds?: readonly string[] | null;
  readonly canWrite: boolean;
  readonly canApprove: boolean;
  readonly canReadAudit: boolean;
  readonly canReadRestricted: boolean;
  readonly canManageGrievances: boolean;
  readonly canReadLegalReferences: boolean;
  readonly canExposePayroll: boolean;
  readonly canExposeIntegrations: boolean;
  readonly canExportReports: boolean;
  readonly searchParams?: HrSuiteSearchParamSource | HrIndustryUcbSearchParams;
}): HrIndustryUcbPageModelInput {
  const parsed: HrIndustryUcbSearchParams = isHrIndustryUcbSearchParams(
    input.searchParams,
  )
    ? input.searchParams
    : parseHrIndustryUcbSearchParams(input.searchParams);

  return {
    organizationId: input.organizationId,
    visibleEmployeeIds: input.visibleEmployeeIds ?? null,
    canWrite: input.canWrite,
    canApprove: input.canApprove,
    canReadAudit: input.canReadAudit,
    canReadRestricted: input.canReadRestricted,
    canManageGrievances: input.canManageGrievances,
    canReadLegalReferences: input.canReadLegalReferences,
    canExposePayroll: input.canExposePayroll,
    canExposeIntegrations: input.canExposeIntegrations,
    canExportReports: input.canExportReports,
    ...parsed,
  };
}
