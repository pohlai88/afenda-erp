import { z } from "zod";

import {
  readHrSuiteSearchParam,
  type HrSuiteSearchParamSource,
} from "../../../hr-suite-integration/metadata";
import {
  HR_TALENT_RSS_REPORT_GROUP_BY,
  HR_TALENT_RSS_STATUS_FILTERS,
  type HrTalentRssReportGroupBy,
  type HrTalentRssStatusFilter,
} from "../schemas/hr.talent.rss-constants.shared";

export const hrTalentRssReportGroupByParam =
  "hrTalentRssReportGroupBy";
export const hrTalentRssStatusParam = "hrTalentRssStatus";

export type HrTalentRssSearchParams = {
  readonly candidateProfilesSearch?: string;
  readonly jobPostingsSearch?: string;
  readonly applicationsSearch?: string;
  readonly documentsSearch?: string;
  readonly interviewsSearch?: string;
  readonly assessmentsSearch?: string;
  readonly formsSearch?: string;
  readonly offersSearch?: string;
  readonly internalApplicationsSearch?: string;
  readonly requisitionRequestsSearch?: string;
  readonly candidateReviewsSearch?: string;
  readonly scorecardsSearch?: string;
  readonly approvalsSearch?: string;
  readonly roleTasksSearch?: string;
  readonly notificationsSearch?: string;
  readonly privacyRecordsSearch?: string;
  readonly accessLogSearch?: string;
  readonly retentionActionsSearch?: string;
  readonly reportsSearch?: string;
  readonly auditTrailSearch?: string;
  readonly reportGroupBy: HrTalentRssReportGroupBy;
  readonly status: HrTalentRssStatusFilter;
};

export type HrTalentRssPageModelInput = {
  readonly organizationId: string;
  readonly visibleCandidateIds?: readonly string[] | null;
  readonly canWrite: boolean;
  readonly canApprove: boolean;
  readonly canReadAudit: boolean;
  readonly canReadRestricted: boolean;
  readonly canExposeIntegrations: boolean;
} & HrTalentRssSearchParams;

const reportGroupBySchema = z
  .enum(HR_TALENT_RSS_REPORT_GROUP_BY)
  .catch("status");
const statusFilterSchema = z
  .enum(HR_TALENT_RSS_STATUS_FILTERS)
  .catch("all");

function readOptionalSearch(
  searchParams: HrSuiteSearchParamSource | undefined,
  key: string,
) {
  return readHrSuiteSearchParam(searchParams, key) || undefined;
}

function isHrTalentRssSearchParams(
  value: unknown,
): value is HrTalentRssSearchParams {
  return (
    typeof value === "object" &&
    value !== null &&
    "reportGroupBy" in value &&
    "status" in value
  );
}

export function parseHrTalentRssSearchParams(
  searchParams?: HrSuiteSearchParamSource,
): HrTalentRssSearchParams {
  return {
    candidateProfilesSearch: readOptionalSearch(
      searchParams,
      "hrTalentRssCandidateProfilesSearch",
    ),
    jobPostingsSearch: readOptionalSearch(
      searchParams,
      "hrTalentRssJobPostingsSearch",
    ),
    applicationsSearch: readOptionalSearch(
      searchParams,
      "hrTalentRssApplicationsSearch",
    ),
    documentsSearch: readOptionalSearch(
      searchParams,
      "hrTalentRssDocumentsSearch",
    ),
    interviewsSearch: readOptionalSearch(
      searchParams,
      "hrTalentRssInterviewsSearch",
    ),
    assessmentsSearch: readOptionalSearch(
      searchParams,
      "hrTalentRssAssessmentsSearch",
    ),
    formsSearch: readOptionalSearch(searchParams, "hrTalentRssFormsSearch"),
    offersSearch: readOptionalSearch(searchParams, "hrTalentRssOffersSearch"),
    internalApplicationsSearch: readOptionalSearch(
      searchParams,
      "hrTalentRssInternalApplicationsSearch",
    ),
    requisitionRequestsSearch: readOptionalSearch(
      searchParams,
      "hrTalentRssRequisitionRequestsSearch",
    ),
    candidateReviewsSearch: readOptionalSearch(
      searchParams,
      "hrTalentRssCandidateReviewsSearch",
    ),
    scorecardsSearch: readOptionalSearch(
      searchParams,
      "hrTalentRssScorecardsSearch",
    ),
    approvalsSearch: readOptionalSearch(
      searchParams,
      "hrTalentRssApprovalsSearch",
    ),
    roleTasksSearch: readOptionalSearch(
      searchParams,
      "hrTalentRssRoleTasksSearch",
    ),
    notificationsSearch: readOptionalSearch(
      searchParams,
      "hrTalentRssNotificationsSearch",
    ),
    privacyRecordsSearch: readOptionalSearch(
      searchParams,
      "hrTalentRssPrivacyRecordsSearch",
    ),
    accessLogSearch: readOptionalSearch(
      searchParams,
      "hrTalentRssAccessLogSearch",
    ),
    retentionActionsSearch: readOptionalSearch(
      searchParams,
      "hrTalentRssRetentionActionsSearch",
    ),
    reportsSearch: readOptionalSearch(searchParams, "hrTalentRssReportsSearch"),
    auditTrailSearch: readOptionalSearch(
      searchParams,
      "hrTalentRssAuditTrailSearch",
    ),
    reportGroupBy: reportGroupBySchema.parse(
      readHrSuiteSearchParam(searchParams, hrTalentRssReportGroupByParam),
    ),
    status: statusFilterSchema.parse(
      readHrSuiteSearchParam(searchParams, hrTalentRssStatusParam),
    ),
  };
}

export function toHrTalentRssPageModelInput(input: {
  readonly organizationId: string;
  readonly visibleCandidateIds?: readonly string[] | null;
  readonly canWrite?: boolean;
  readonly canApprove?: boolean;
  readonly canReadAudit?: boolean;
  readonly canReadRestricted?: boolean;
  readonly canExposeIntegrations?: boolean;
  readonly searchParams?: HrSuiteSearchParamSource | HrTalentRssSearchParams;
}): HrTalentRssPageModelInput {
  const parsed: HrTalentRssSearchParams = isHrTalentRssSearchParams(
    input.searchParams,
  )
    ? input.searchParams
    : parseHrTalentRssSearchParams(input.searchParams);

  return {
    organizationId: input.organizationId,
    visibleCandidateIds: input.visibleCandidateIds ?? null,
    canWrite: input.canWrite ?? false,
    canApprove: input.canApprove ?? false,
    canReadAudit: input.canReadAudit ?? false,
    canReadRestricted: input.canReadRestricted ?? false,
    canExposeIntegrations: input.canExposeIntegrations ?? false,
    ...parsed,
  };
}
