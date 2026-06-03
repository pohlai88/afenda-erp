import { z } from "zod";

import {
  readHrSuiteSearchParam,
  type HrSuiteSearchParamSource,
} from "../../employee-management/compliance-regulatory-tracking/metadata";
import {
  HR_GPG_ASSIGNMENT_VALIDATION_STATUSES,
  HR_GPG_CLASSIFICATION_STATUSES,
  HR_GPG_REPORT_GROUP_BY,
  type HrGpgAssignmentValidationStatus,
  type HrGpgClassificationStatus,
  type HrGpgReportGroupBy,
} from "./hr.industry.gpg-constants.shared";

export const hrIndustryGpgReportGroupByParam = "gpgReportGroupBy";
export const hrIndustryGpgStatusParam = "gpgStatus";

export type HrIndustryGpgStatusFilter =
  | HrGpgClassificationStatus
  | HrGpgAssignmentValidationStatus
  | "all";

export type HrIndustryGpgSearchParams = {
  readonly classificationsSearch?: string;
  readonly payGradesSearch?: string;
  readonly salaryTablesSearch?: string;
  readonly localityAdjustmentsSearch?: string;
  readonly classificationAssignmentsSearch?: string;
  readonly stepEligibilityRulesSearch?: string;
  readonly stepIncreaseCandidatesSearch?: string;
  readonly gradeMovementsSearch?: string;
  readonly classificationReviewsSearch?: string;
  readonly reportsSearch?: string;
  readonly integrationExposuresSearch?: string;
  readonly auditTrailSearch?: string;
  readonly reportGroupBy: HrGpgReportGroupBy;
  readonly status: HrIndustryGpgStatusFilter;
};

export type HrIndustryGpgPageModelInput = {
  readonly organizationId: string;
  readonly visibleEmployeeIds: readonly string[] | null;
  readonly canWrite: boolean;
  readonly canApprove: boolean;
  readonly canReadAudit: boolean;
  readonly canReadRestricted: boolean;
  readonly canExposeIntegrations: boolean;
} & HrIndustryGpgSearchParams;

const reportGroupBySchema = z
  .enum(HR_GPG_REPORT_GROUP_BY)
  .catch("classification");
const statusFilterSchema = z
  .enum([
    ...HR_GPG_CLASSIFICATION_STATUSES,
    ...HR_GPG_ASSIGNMENT_VALIDATION_STATUSES,
    "all",
  ] as const)
  .catch("all");

function readOptionalSearch(
  searchParams: HrSuiteSearchParamSource | undefined,
  key: string,
) {
  return readHrSuiteSearchParam(searchParams, key) || undefined;
}

function isHrIndustryGpgSearchParams(
  value: unknown,
): value is HrIndustryGpgSearchParams {
  return (
    typeof value === "object" &&
    value !== null &&
    "reportGroupBy" in value &&
    "status" in value
  );
}

export function parseHrIndustryGpgSearchParams(
  searchParams?: HrSuiteSearchParamSource,
): HrIndustryGpgSearchParams {
  return {
    classificationsSearch: readOptionalSearch(
      searchParams,
      "gpgClassificationsSearch",
    ),
    payGradesSearch: readOptionalSearch(searchParams, "gpgPayGradesSearch"),
    salaryTablesSearch: readOptionalSearch(
      searchParams,
      "gpgSalaryTablesSearch",
    ),
    localityAdjustmentsSearch: readOptionalSearch(
      searchParams,
      "gpgLocalitySearch",
    ),
    classificationAssignmentsSearch: readOptionalSearch(
      searchParams,
      "gpgClassificationAssignmentsSearch",
    ),
    stepEligibilityRulesSearch: readOptionalSearch(
      searchParams,
      "gpgStepRulesSearch",
    ),
    stepIncreaseCandidatesSearch: readOptionalSearch(
      searchParams,
      "gpgStepCandidatesSearch",
    ),
    gradeMovementsSearch: readOptionalSearch(
      searchParams,
      "gpgGradeMovementsSearch",
    ),
    classificationReviewsSearch: readOptionalSearch(
      searchParams,
      "gpgReviewsSearch",
    ),
    reportsSearch: readOptionalSearch(searchParams, "gpgReportsSearch"),
    integrationExposuresSearch: readOptionalSearch(
      searchParams,
      "gpgIntegrationsSearch",
    ),
    auditTrailSearch: readOptionalSearch(searchParams, "gpgAuditTrailSearch"),
    reportGroupBy: reportGroupBySchema.parse(
      readHrSuiteSearchParam(searchParams, hrIndustryGpgReportGroupByParam),
    ),
    status: statusFilterSchema.parse(
      readHrSuiteSearchParam(searchParams, hrIndustryGpgStatusParam),
    ),
  };
}

export function toHrIndustryGpgPageModelInput(input: {
  readonly organizationId: string;
  readonly visibleEmployeeIds?: readonly string[] | null;
  readonly canWrite: boolean;
  readonly canApprove: boolean;
  readonly canReadAudit: boolean;
  readonly canReadRestricted: boolean;
  readonly canExposeIntegrations: boolean;
  readonly searchParams?: HrSuiteSearchParamSource | HrIndustryGpgSearchParams;
}): HrIndustryGpgPageModelInput {
  const parsed = isHrIndustryGpgSearchParams(input.searchParams)
    ? input.searchParams
    : parseHrIndustryGpgSearchParams(input.searchParams);

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
