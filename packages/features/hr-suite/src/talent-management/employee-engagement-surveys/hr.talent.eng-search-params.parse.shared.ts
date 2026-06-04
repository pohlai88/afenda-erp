import { z } from "zod";

import {
  readHrSuiteSearchParam,
  type HrSuiteSearchParamSource,
} from "../../hr-suite-integration/metadata";
import {
  HR_TALENT_ENG_REPORT_GROUP_BY,
  HR_TALENT_ENG_SEGMENT_DIMENSION_FILTERS,
  HR_TALENT_ENG_STATUS_FILTERS,
  type HrTalentEngReportGroupBy,
  type HrTalentEngSegmentDimensionFilter,
  type HrTalentEngStatusFilter,
} from "./hr.talent.eng-constants.shared";

export const hrTalentEngReportGroupByParam =
  "hrTalentEngReportGroupBy";
export const hrTalentEngStatusParam = "hrTalentEngStatus";
export const hrTalentEngSurveyIdParam = "hrTalentEngSurveyId";
export const hrTalentEngSegmentDimensionParam =
  "hrTalentEngSegmentDimension";

export type HrTalentEngSearchParams = {
  readonly templatesSearch?: string;
  readonly questionsSearch?: string;
  readonly surveysSearch?: string;
  readonly audienceSegmentsSearch?: string;
  readonly invitationsSearch?: string;
  readonly responsesSearch?: string;
  readonly completionSearch?: string;
  readonly questionScoresSearch?: string;
  readonly categoryScoresSearch?: string;
  readonly segmentScoresSearch?: string;
  readonly commentsSearch?: string;
  readonly benchmarksSearch?: string;
  readonly cycleHistorySearch?: string;
  readonly actionsSearch?: string;
  readonly notificationsSearch?: string;
  readonly reportsSearch?: string;
  readonly auditTrailSearch?: string;
  readonly reportGroupBy: HrTalentEngReportGroupBy;
  readonly status: HrTalentEngStatusFilter;
  readonly surveyId?: string;
  readonly segmentDimension: HrTalentEngSegmentDimensionFilter;
};

export type HrTalentEngPageModelInput = {
  readonly organizationId: string;
  readonly actorUserId?: string;
  readonly visibleEmployeeIds?: readonly string[] | null;
  readonly canWrite: boolean;
  readonly canApprove: boolean;
  readonly canReadAudit: boolean;
  readonly canReadRestricted: boolean;
  readonly canExposeIntegrations: boolean;
} & HrTalentEngSearchParams;

const reportGroupBySchema = z
  .enum(HR_TALENT_ENG_REPORT_GROUP_BY)
  .catch("survey");
const statusFilterSchema = z
  .enum(HR_TALENT_ENG_STATUS_FILTERS)
  .catch("all");
const segmentDimensionSchema = z
  .enum(HR_TALENT_ENG_SEGMENT_DIMENSION_FILTERS)
  .catch("all");

function readOptionalSearch(
  searchParams: HrSuiteSearchParamSource | undefined,
  key: string,
) {
  return readHrSuiteSearchParam(searchParams, key) || undefined;
}

function isHrTalentEngSearchParams(
  value: unknown,
): value is HrTalentEngSearchParams {
  return (
    typeof value === "object" &&
    value !== null &&
    "reportGroupBy" in value &&
    "status" in value &&
    "segmentDimension" in value
  );
}

export function parseHrTalentEngSearchParams(
  searchParams?: HrSuiteSearchParamSource,
): HrTalentEngSearchParams {
  return {
    templatesSearch: readOptionalSearch(searchParams, "hrTalentEngTemplatesSearch"),
    questionsSearch: readOptionalSearch(searchParams, "hrTalentEngQuestionsSearch"),
    surveysSearch: readOptionalSearch(searchParams, "hrTalentEngSurveysSearch"),
    audienceSegmentsSearch: readOptionalSearch(
      searchParams,
      "hrTalentEngAudienceSearch",
    ),
    invitationsSearch: readOptionalSearch(
      searchParams,
      "hrTalentEngInvitationsSearch",
    ),
    responsesSearch: readOptionalSearch(searchParams, "hrTalentEngResponsesSearch"),
    completionSearch: readOptionalSearch(
      searchParams,
      "hrTalentEngCompletionSearch",
    ),
    questionScoresSearch: readOptionalSearch(
      searchParams,
      "hrTalentEngQuestionScoresSearch",
    ),
    categoryScoresSearch: readOptionalSearch(
      searchParams,
      "hrTalentEngCategoryScoresSearch",
    ),
    segmentScoresSearch: readOptionalSearch(
      searchParams,
      "hrTalentEngSegmentScoresSearch",
    ),
    commentsSearch: readOptionalSearch(searchParams, "hrTalentEngCommentsSearch"),
    benchmarksSearch: readOptionalSearch(
      searchParams,
      "hrTalentEngBenchmarksSearch",
    ),
    cycleHistorySearch: readOptionalSearch(
      searchParams,
      "hrTalentEngCycleHistorySearch",
    ),
    actionsSearch: readOptionalSearch(searchParams, "hrTalentEngActionsSearch"),
    notificationsSearch: readOptionalSearch(
      searchParams,
      "hrTalentEngNotificationsSearch",
    ),
    reportsSearch: readOptionalSearch(searchParams, "hrTalentEngReportsSearch"),
    auditTrailSearch: readOptionalSearch(
      searchParams,
      "hrTalentEngAuditTrailSearch",
    ),
    reportGroupBy: reportGroupBySchema.parse(
      readHrSuiteSearchParam(searchParams, hrTalentEngReportGroupByParam),
    ),
    status: statusFilterSchema.parse(
      readHrSuiteSearchParam(searchParams, hrTalentEngStatusParam),
    ),
    surveyId: readOptionalSearch(searchParams, hrTalentEngSurveyIdParam),
    segmentDimension: segmentDimensionSchema.parse(
      readHrSuiteSearchParam(searchParams, hrTalentEngSegmentDimensionParam),
    ),
  };
}

export function toHrTalentEngPageModelInput(input: {
  readonly organizationId: string;
  readonly actorUserId?: string;
  readonly visibleEmployeeIds?: readonly string[] | null;
  readonly canWrite?: boolean;
  readonly canApprove?: boolean;
  readonly canReadAudit?: boolean;
  readonly canReadRestricted?: boolean;
  readonly canExposeIntegrations?: boolean;
  readonly searchParams?: HrSuiteSearchParamSource | HrTalentEngSearchParams;
}): HrTalentEngPageModelInput {
  const parsed: HrTalentEngSearchParams = isHrTalentEngSearchParams(
    input.searchParams,
  )
    ? input.searchParams
    : parseHrTalentEngSearchParams(input.searchParams);

  return {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    visibleEmployeeIds: input.visibleEmployeeIds,
    canWrite: input.canWrite ?? false,
    canApprove: input.canApprove ?? false,
    canReadAudit: input.canReadAudit ?? false,
    canReadRestricted: input.canReadRestricted ?? false,
    canExposeIntegrations: input.canExposeIntegrations ?? false,
    ...parsed,
  };
}
