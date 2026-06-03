import { z } from "zod";

import {
  HR_RON_REPORT_GROUP_BY,
  type HrRonReportGroupBy,
} from "./hr.talent.ron-constants.shared";

export const hrRonRequisitionsSearchParam = "recruitmentRequisitionsSearch";
export const hrRonPostingsSearchParam = "recruitmentPostingsSearch";
export const hrRonApplicationsSearchParam = "recruitmentApplicationsSearch";
export const hrRonInterviewsSearchParam = "recruitmentInterviewsSearch";
export const hrRonOffersSearchParam = "recruitmentOffersSearch";
export const hrRonOnboardingTasksSearchParam =
  "recruitmentOnboardingTasksSearch";
export const hrRonReadinessSearchParam = "recruitmentReadinessSearch";
export const hrRonReportsSearchParam = "recruitmentReportsSearch";
export const hrRonAuditTrailSearchParam = "recruitmentAuditTrailSearch";
export const hrRonReportGroupByParam = "recruitmentReportGroupBy";

export const hrRonRequisitionsSurfaceKey =
  "hr.talent.recruitment-onboarding.requisitions.list";
export const hrRonPostingsSurfaceKey =
  "hr.talent.recruitment-onboarding.postings.list";
export const hrRonApplicationsSurfaceKey =
  "hr.talent.recruitment-onboarding.applications.list";
export const hrRonInterviewsSurfaceKey =
  "hr.talent.recruitment-onboarding.interviews.list";
export const hrRonOffersSurfaceKey =
  "hr.talent.recruitment-onboarding.offers.list";
export const hrRonOnboardingTasksSurfaceKey =
  "hr.talent.recruitment-onboarding.onboarding-tasks.list";
export const hrRonReadinessSurfaceKey =
  "hr.talent.recruitment-onboarding.readiness.list";
export const hrRonReportsSurfaceKey =
  "hr.talent.recruitment-onboarding.reports.list";
export const hrRonAuditTrailSurfaceKey =
  "hr.talent.recruitment-onboarding.audit-trail.list";

export const HR_RON_LIST_SURFACE_KEYS = [
  hrRonRequisitionsSurfaceKey,
  hrRonPostingsSurfaceKey,
  hrRonApplicationsSurfaceKey,
  hrRonInterviewsSurfaceKey,
  hrRonOffersSurfaceKey,
  hrRonOnboardingTasksSurfaceKey,
  hrRonReadinessSurfaceKey,
  hrRonReportsSurfaceKey,
  hrRonAuditTrailSurfaceKey,
] as const;

export type HrRonListSurfaceKey = (typeof HR_RON_LIST_SURFACE_KEYS)[number];

export const HR_RON_LIST_SEARCH_PARAMS_BY_KEY = {
  [hrRonRequisitionsSurfaceKey]: hrRonRequisitionsSearchParam,
  [hrRonPostingsSurfaceKey]: hrRonPostingsSearchParam,
  [hrRonApplicationsSurfaceKey]: hrRonApplicationsSearchParam,
  [hrRonInterviewsSurfaceKey]: hrRonInterviewsSearchParam,
  [hrRonOffersSurfaceKey]: hrRonOffersSearchParam,
  [hrRonOnboardingTasksSurfaceKey]: hrRonOnboardingTasksSearchParam,
  [hrRonReadinessSurfaceKey]: hrRonReadinessSearchParam,
  [hrRonReportsSurfaceKey]: hrRonReportsSearchParam,
  [hrRonAuditTrailSurfaceKey]: hrRonAuditTrailSearchParam,
} as const;

export const HR_RON_LIST_SEARCH_PARAM_MODEL_FIELDS = {
  [hrRonRequisitionsSearchParam]: "requisitionsSearch",
  [hrRonPostingsSearchParam]: "postingsSearch",
  [hrRonApplicationsSearchParam]: "applicationsSearch",
  [hrRonInterviewsSearchParam]: "interviewsSearch",
  [hrRonOffersSearchParam]: "offersSearch",
  [hrRonOnboardingTasksSearchParam]: "onboardingTasksSearch",
  [hrRonReadinessSearchParam]: "readinessSearch",
  [hrRonReportsSearchParam]: "reportsSearch",
  [hrRonAuditTrailSearchParam]: "auditTrailSearch",
} as const;

export const HR_RON_WORKBENCH_READ_ONLY_SURFACE_KEYS = [
  hrRonReportsSurfaceKey,
  hrRonAuditTrailSurfaceKey,
] as const;

export type HrRonSearchParams = {
  requisitionsSearch?: string;
  postingsSearch?: string;
  applicationsSearch?: string;
  interviewsSearch?: string;
  offersSearch?: string;
  onboardingTasksSearch?: string;
  readinessSearch?: string;
  reportsSearch?: string;
  auditTrailSearch?: string;
  reportGroupBy: HrRonReportGroupBy;
};

function readSearchParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const value = searchParams[key];
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

const reportGroupBySchema = z.enum(HR_RON_REPORT_GROUP_BY).catch("stage");

export function parseHrRonSearchParams(
  searchParams?: Record<string, string | string[] | undefined>,
): HrRonSearchParams {
  if (!searchParams) {
    return { reportGroupBy: "stage" };
  }
  const reportGroupBy = reportGroupBySchema.parse(
    readSearchParam(searchParams, hrRonReportGroupByParam),
  );
  return {
    requisitionsSearch: readSearchParam(searchParams, hrRonRequisitionsSearchParam),
    postingsSearch: readSearchParam(searchParams, hrRonPostingsSearchParam),
    applicationsSearch: readSearchParam(searchParams, hrRonApplicationsSearchParam),
    interviewsSearch: readSearchParam(searchParams, hrRonInterviewsSearchParam),
    offersSearch: readSearchParam(searchParams, hrRonOffersSearchParam),
    onboardingTasksSearch: readSearchParam(
      searchParams,
      hrRonOnboardingTasksSearchParam,
    ),
    readinessSearch: readSearchParam(searchParams, hrRonReadinessSearchParam),
    reportsSearch: readSearchParam(searchParams, hrRonReportsSearchParam),
    auditTrailSearch: readSearchParam(searchParams, hrRonAuditTrailSearchParam),
    reportGroupBy,
  };
}

export function toHrRonPageModelInput(input: {
  organizationId: string;
  canWrite: boolean;
  canApproveRequisitions: boolean;
  canApproveOffers: boolean;
  canReadSensitiveCandidateData: boolean;
  canReadFinance: boolean;
  canReadIt: boolean;
  canReadAudit: boolean;
  searchParams?: Record<string, string | string[] | undefined> | HrRonSearchParams;
}): {
  organizationId: string;
  canWrite: boolean;
  canApproveRequisitions: boolean;
  canApproveOffers: boolean;
  canReadSensitiveCandidateData: boolean;
  canReadFinance: boolean;
  canReadIt: boolean;
  canReadAudit: boolean;
} & HrRonSearchParams {
  const parsed: HrRonSearchParams =
    input.searchParams && "reportGroupBy" in input.searchParams
      ? (input.searchParams as HrRonSearchParams)
      : parseHrRonSearchParams(input.searchParams);
  return {
    organizationId: input.organizationId,
    canWrite: input.canWrite,
    canApproveRequisitions: input.canApproveRequisitions,
    canApproveOffers: input.canApproveOffers,
    canReadSensitiveCandidateData: input.canReadSensitiveCandidateData,
    canReadFinance: input.canReadFinance,
    canReadIt: input.canReadIt,
    canReadAudit: input.canReadAudit,
    ...parsed,
  };
}
