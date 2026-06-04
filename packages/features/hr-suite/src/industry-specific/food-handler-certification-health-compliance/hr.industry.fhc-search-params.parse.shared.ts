import { z } from "zod";

import {
  readHrSuiteSearchParam,
  type HrSuiteSearchParamSource,
} from "../../hr-suite-integration/metadata";
import {
  HR_FHC_COMPLIANCE_STATUSES,
  HR_FHC_REPORT_GROUP_BY,
  type HrFhcComplianceStatus,
  type HrFhcReportGroupBy,
} from "./hr.industry.fhc-constants.shared";

export const hrIndustryFhcReportGroupByParam = "fhcReportGroupBy";
export const hrIndustryFhcStatusParam = "fhcStatus";

export type HrIndustryFhcStatusFilter = HrFhcComplianceStatus | "all";

export type HrIndustryFhcSearchParams = {
  readonly requirementRulesSearch?: string;
  readonly employeeComplianceSearch?: string;
  readonly permitsSearch?: string;
  readonly healthCertificationsSearch?: string;
  readonly trainingCompletionsSearch?: string;
  readonly evidenceSubmissionsSearch?: string;
  readonly renewalCasesSearch?: string;
  readonly alertsSearch?: string;
  readonly dutyRestrictionsSearch?: string;
  readonly integrationExposuresSearch?: string;
  readonly reportsSearch?: string;
  readonly auditTrailSearch?: string;
  readonly reportGroupBy: HrFhcReportGroupBy;
  readonly status: HrIndustryFhcStatusFilter;
};

export type HrIndustryFhcPageModelInput = {
  readonly organizationId: string;
  readonly visibleEmployeeIds: readonly string[] | null;
  readonly canWrite: boolean;
  readonly canApprove: boolean;
  readonly canReadAudit: boolean;
  readonly canReadRestricted: boolean;
  readonly canExposeIntegrations: boolean;
} & HrIndustryFhcSearchParams;

const reportGroupBySchema = z.enum(HR_FHC_REPORT_GROUP_BY).catch("outlet");
const statusFilterSchema = z
  .enum([...HR_FHC_COMPLIANCE_STATUSES, "all"] as const)
  .catch("all");

function readOptionalSearch(
  searchParams: HrSuiteSearchParamSource | undefined,
  key: string,
) {
  return readHrSuiteSearchParam(searchParams, key) || undefined;
}

function isHrIndustryFhcSearchParams(
  value: unknown,
): value is HrIndustryFhcSearchParams {
  return (
    typeof value === "object" &&
    value !== null &&
    "reportGroupBy" in value &&
    "status" in value
  );
}

export function parseHrIndustryFhcSearchParams(
  searchParams?: HrSuiteSearchParamSource,
): HrIndustryFhcSearchParams {
  return {
    requirementRulesSearch: readOptionalSearch(
      searchParams,
      "fhcRequirementRulesSearch",
    ),
    employeeComplianceSearch: readOptionalSearch(
      searchParams,
      "fhcEmployeeComplianceSearch",
    ),
    permitsSearch: readOptionalSearch(searchParams, "fhcPermitsSearch"),
    healthCertificationsSearch: readOptionalSearch(
      searchParams,
      "fhcHealthCertificationsSearch",
    ),
    trainingCompletionsSearch: readOptionalSearch(
      searchParams,
      "fhcTrainingSearch",
    ),
    evidenceSubmissionsSearch: readOptionalSearch(
      searchParams,
      "fhcEvidenceSearch",
    ),
    renewalCasesSearch: readOptionalSearch(searchParams, "fhcRenewalsSearch"),
    alertsSearch: readOptionalSearch(searchParams, "fhcAlertsSearch"),
    dutyRestrictionsSearch: readOptionalSearch(
      searchParams,
      "fhcRestrictionsSearch",
    ),
    integrationExposuresSearch: readOptionalSearch(
      searchParams,
      "fhcIntegrationsSearch",
    ),
    reportsSearch: readOptionalSearch(searchParams, "fhcReportsSearch"),
    auditTrailSearch: readOptionalSearch(searchParams, "fhcAuditTrailSearch"),
    reportGroupBy: reportGroupBySchema.parse(
      readHrSuiteSearchParam(searchParams, hrIndustryFhcReportGroupByParam),
    ),
    status: statusFilterSchema.parse(
      readHrSuiteSearchParam(searchParams, hrIndustryFhcStatusParam),
    ),
  };
}

export function toHrIndustryFhcPageModelInput(input: {
  readonly organizationId: string;
  readonly visibleEmployeeIds?: readonly string[] | null;
  readonly canWrite: boolean;
  readonly canApprove: boolean;
  readonly canReadAudit: boolean;
  readonly canReadRestricted: boolean;
  readonly canExposeIntegrations: boolean;
  readonly searchParams?: HrSuiteSearchParamSource | HrIndustryFhcSearchParams;
}): HrIndustryFhcPageModelInput {
  const parsed = isHrIndustryFhcSearchParams(input.searchParams)
    ? input.searchParams
    : parseHrIndustryFhcSearchParams(input.searchParams);

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
