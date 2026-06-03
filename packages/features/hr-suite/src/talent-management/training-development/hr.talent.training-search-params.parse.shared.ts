import { z } from "zod";

import {
  readHrSuiteSearchParam,
  type HrSuiteSearchParamSource,
} from "../../employee-management/compliance-regulatory-tracking/metadata";
import {
  HR_TRAINING_REPORT_GROUP_BY,
  type HrTrainingReportGroupBy,
} from "./hr.talent.training-constants.shared";

export const hrTrainingCoursesSearchParam = "trainingCoursesSearch";
export const hrTrainingProvidersSearchParam = "trainingProvidersSearch";
export const hrTrainingRequirementsSearchParam = "trainingRequirementsSearch";
export const hrTrainingAssignmentsSearchParam = "trainingAssignmentsSearch";
export const hrTrainingEnrollmentsSearchParam = "trainingEnrollmentsSearch";
export const hrTrainingAttendanceSearchParam = "trainingAttendanceSearch";
export const hrTrainingCompletionsSearchParam = "trainingCompletionsSearch";
export const hrTrainingAssessmentsSearchParam = "trainingAssessmentsSearch";
export const hrTrainingSkillsSearchParam = "trainingSkillsSearch";
export const hrTrainingCompetenciesSearchParam = "trainingCompetenciesSearch";
export const hrTrainingSkillGapsSearchParam = "trainingSkillGapsSearch";
export const hrTrainingDevelopmentPlansSearchParam =
  "trainingDevelopmentPlansSearch";
export const hrTrainingCertificationsSearchParam =
  "trainingCertificationsSearch";
export const hrTrainingAlertsSearchParam = "trainingAlertsSearch";
export const hrTrainingFeedbackSearchParam = "trainingFeedbackSearch";
export const hrTrainingCostsSearchParam = "trainingCostsSearch";
export const hrTrainingComplianceSearchParam = "trainingComplianceSearch";
export const hrTrainingReadinessSearchParam = "trainingReadinessSearch";
export const hrTrainingBoardingSearchParam = "trainingBoardingSearch";
export const hrTrainingReportsSearchParam = "trainingReportsSearch";
export const hrTrainingAuditTrailSearchParam = "trainingAuditTrailSearch";
export const hrTrainingReportGroupByParam = "trainingReportGroupBy";

export type HrTrainingSearchParams = {
  readonly coursesSearch?: string;
  readonly providersSearch?: string;
  readonly requirementsSearch?: string;
  readonly assignmentsSearch?: string;
  readonly enrollmentsSearch?: string;
  readonly attendanceSearch?: string;
  readonly completionsSearch?: string;
  readonly assessmentsSearch?: string;
  readonly skillsSearch?: string;
  readonly competenciesSearch?: string;
  readonly skillGapsSearch?: string;
  readonly developmentPlansSearch?: string;
  readonly certificationsSearch?: string;
  readonly alertsSearch?: string;
  readonly feedbackSearch?: string;
  readonly costsSearch?: string;
  readonly complianceSearch?: string;
  readonly readinessSearch?: string;
  readonly boardingSearch?: string;
  readonly reportsSearch?: string;
  readonly auditTrailSearch?: string;
  readonly reportGroupBy: HrTrainingReportGroupBy;
};

export type HrTrainingPageModelInput = {
  readonly organizationId: string;
  readonly visibleEmployeeIds: readonly string[] | null;
  readonly canWrite: boolean;
  readonly canApprove: boolean;
  readonly canReadAudit: boolean;
  readonly canReadRestricted: boolean;
  readonly canExposeIntegrations: boolean;
} & HrTrainingSearchParams;

const reportGroupBySchema = z
  .enum(HR_TRAINING_REPORT_GROUP_BY)
  .catch("department");

function readOptionalSearch(
  searchParams: HrSuiteSearchParamSource | undefined,
  key: string,
) {
  return readHrSuiteSearchParam(searchParams, key) || undefined;
}

function isHrTrainingSearchParams(
  value: unknown,
): value is HrTrainingSearchParams {
  return (
    typeof value === "object" &&
    value !== null &&
    "reportGroupBy" in value
  );
}

export function parseHrTrainingSearchParams(
  searchParams?: HrSuiteSearchParamSource,
): HrTrainingSearchParams {
  return {
    coursesSearch: readOptionalSearch(searchParams, hrTrainingCoursesSearchParam),
    providersSearch: readOptionalSearch(
      searchParams,
      hrTrainingProvidersSearchParam,
    ),
    requirementsSearch: readOptionalSearch(
      searchParams,
      hrTrainingRequirementsSearchParam,
    ),
    assignmentsSearch: readOptionalSearch(
      searchParams,
      hrTrainingAssignmentsSearchParam,
    ),
    enrollmentsSearch: readOptionalSearch(
      searchParams,
      hrTrainingEnrollmentsSearchParam,
    ),
    attendanceSearch: readOptionalSearch(
      searchParams,
      hrTrainingAttendanceSearchParam,
    ),
    completionsSearch: readOptionalSearch(
      searchParams,
      hrTrainingCompletionsSearchParam,
    ),
    assessmentsSearch: readOptionalSearch(
      searchParams,
      hrTrainingAssessmentsSearchParam,
    ),
    skillsSearch: readOptionalSearch(searchParams, hrTrainingSkillsSearchParam),
    competenciesSearch: readOptionalSearch(
      searchParams,
      hrTrainingCompetenciesSearchParam,
    ),
    skillGapsSearch: readOptionalSearch(
      searchParams,
      hrTrainingSkillGapsSearchParam,
    ),
    developmentPlansSearch: readOptionalSearch(
      searchParams,
      hrTrainingDevelopmentPlansSearchParam,
    ),
    certificationsSearch: readOptionalSearch(
      searchParams,
      hrTrainingCertificationsSearchParam,
    ),
    alertsSearch: readOptionalSearch(searchParams, hrTrainingAlertsSearchParam),
    feedbackSearch: readOptionalSearch(
      searchParams,
      hrTrainingFeedbackSearchParam,
    ),
    costsSearch: readOptionalSearch(searchParams, hrTrainingCostsSearchParam),
    complianceSearch: readOptionalSearch(
      searchParams,
      hrTrainingComplianceSearchParam,
    ),
    readinessSearch: readOptionalSearch(
      searchParams,
      hrTrainingReadinessSearchParam,
    ),
    boardingSearch: readOptionalSearch(
      searchParams,
      hrTrainingBoardingSearchParam,
    ),
    reportsSearch: readOptionalSearch(searchParams, hrTrainingReportsSearchParam),
    auditTrailSearch: readOptionalSearch(
      searchParams,
      hrTrainingAuditTrailSearchParam,
    ),
    reportGroupBy: reportGroupBySchema.parse(
      readHrSuiteSearchParam(searchParams, hrTrainingReportGroupByParam),
    ),
  };
}

export function toHrTrainingPageModelInput(input: {
  readonly organizationId: string;
  readonly visibleEmployeeIds?: readonly string[] | null;
  readonly canWrite: boolean;
  readonly canApprove: boolean;
  readonly canReadAudit: boolean;
  readonly canReadRestricted: boolean;
  readonly canExposeIntegrations: boolean;
  readonly searchParams?: HrSuiteSearchParamSource | HrTrainingSearchParams;
}): HrTrainingPageModelInput {
  const parsed = isHrTrainingSearchParams(input.searchParams)
    ? input.searchParams
    : parseHrTrainingSearchParams(input.searchParams);

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

export const parseHrTalentTrainingSearchParams = parseHrTrainingSearchParams;
export const toHrTalentTrainingPageModelInput = toHrTrainingPageModelInput;
export type HrTalentTrainingSearchParams = HrTrainingSearchParams;
export type HrTalentTrainingPageModelInput = HrTrainingPageModelInput;
