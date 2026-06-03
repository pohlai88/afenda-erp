import {
  buildPerformanceReportRows,
  filterPerformanceReviewsForAccess,
  listPerformanceAuditEventsFromStore,
  listPerformanceCyclesFromStore,
  listPerformanceReviewsFromStore,
} from "./hr.talent.performance-store.shared";
import type { HrPerformanceAppraisalsPageModelInput } from "./hr.talent.performance-search-params.parse.shared";
import {
  hrPerformanceAppraisalsApprovalsSurfaceKey,
  hrPerformanceAppraisalsAuditTrailSurfaceKey,
  hrPerformanceAppraisalsCyclesSurfaceKey,
  hrPerformanceAppraisalsGoalsSurfaceKey,
  hrPerformanceAppraisalsOutcomesSurfaceKey,
  hrPerformanceAppraisalsReportsSurfaceKey,
  hrPerformanceAppraisalsReviewsSurfaceKey,
} from "./hr.talent.performance-search-params.parse.shared";
import {
  buildHrPerformanceAppraisalsApprovalsListSurface,
  buildHrPerformanceAppraisalsAuditTrailListSurface,
  buildHrPerformanceAppraisalsCyclesListSurface,
  buildHrPerformanceAppraisalsGoalsListSurface,
  buildHrPerformanceAppraisalsOutcomesListSurface,
  buildHrPerformanceAppraisalsReportsListSurface,
  buildHrPerformanceAppraisalsReviewsListSurface,
} from "./hr.talent.performance-lists.surface";

function containsSearch(value: string, search?: string) {
  if (!search) return true;
  return value.toLowerCase().includes(search.toLowerCase());
}

function joinReviewSearchText(review: {
  employeeDisplayName: string;
  managerDisplayName: string | null;
  departmentName: string;
  status: string;
}) {
  return [
    review.employeeDisplayName,
    review.managerDisplayName ?? "",
    review.departmentName,
    review.status,
  ].join(" ");
}

export type HrPerformanceAppraisalsPageModel = {
  cyclesList: ReturnType<typeof buildHrPerformanceAppraisalsCyclesListSurface>;
  reviewsList: ReturnType<typeof buildHrPerformanceAppraisalsReviewsListSurface>;
  goalsList: ReturnType<typeof buildHrPerformanceAppraisalsGoalsListSurface>;
  approvalsList: ReturnType<typeof buildHrPerformanceAppraisalsApprovalsListSurface>;
  outcomesList: ReturnType<typeof buildHrPerformanceAppraisalsOutcomesListSurface>;
  reportsList: ReturnType<typeof buildHrPerformanceAppraisalsReportsListSurface>;
  auditTrailList:
    | ReturnType<typeof buildHrPerformanceAppraisalsAuditTrailListSurface>
    | null;
  reportGroupBy: HrPerformanceAppraisalsPageModelInput["performanceReportGroupBy"];
};

export async function buildHrPerformanceAppraisalsPageModel(
  input: HrPerformanceAppraisalsPageModelInput,
): Promise<HrPerformanceAppraisalsPageModel> {
  const cycles = listPerformanceCyclesFromStore(input.organizationId).filter(
    (cycle) =>
      containsSearch(
        [cycle.name, cycle.reviewType, cycle.status].join(" "),
        input.performanceCyclesSearch,
      ),
  );
  const visibleEmployeeIds = input.visibleEmployeeIds
    ? new Set(input.visibleEmployeeIds)
    : null;
  const scopedReviews = listPerformanceReviewsFromStore(input.organizationId).filter(
    (review) => !visibleEmployeeIds || visibleEmployeeIds.has(review.employeeId),
  );
  const accessibleReviews = filterPerformanceReviewsForAccess({
    reviews: scopedReviews,
    access: {
      role: input.canWritePerformance ? "hr" : "manager",
      canReadRestricted: input.canWritePerformance,
      canReadCompensationOutcome: input.canReadCompensationOutcome,
    },
  });
  const reviewRows = accessibleReviews.filter((review) =>
    containsSearch(joinReviewSearchText(review), input.performanceReviewsSearch),
  );
  const goalRows = accessibleReviews.filter((review) =>
    containsSearch(
      review.goals.map((goal) => `${goal.title} ${goal.target}`).join(" "),
      input.performanceGoalsSearch,
    ),
  );
  const approvalRows = accessibleReviews.filter((review) =>
    containsSearch(
      review.approvalWorkflow
        .map((step) => `${step.role} ${step.status}`)
        .join(" "),
      input.performanceApprovalsSearch,
    ),
  );
  const outcomeRows = (input.canReadCompensationOutcome ? accessibleReviews : []).filter(
    (review) =>
      containsSearch(
        [
          review.employeeDisplayName,
          review.outcome?.performanceCategory ?? "",
          String(review.outcome?.finalRating ?? ""),
        ].join(" "),
        input.performanceOutcomesSearch,
      ),
  );
  const reportRows = buildPerformanceReportRows({
    cycles,
    reviews: accessibleReviews,
    filter: { groupBy: input.performanceReportGroupBy },
    now: "2026-12-31",
  }).filter((row) =>
    containsSearch(
      [row.groupLabel, row.groupKey, row.groupBy].join(" "),
      input.performanceReportsSearch,
    ),
  );
  const auditRows = input.canReadAudit
    ? listPerformanceAuditEventsFromStore(input.organizationId).filter((event) =>
        containsSearch(
          [event.action, event.summary, event.actorId].join(" "),
          input.performanceAuditTrailSearch,
        ),
      )
    : [];

  return {
    cyclesList: buildHrPerformanceAppraisalsCyclesListSurface({
      surfaceKey: hrPerformanceAppraisalsCyclesSurfaceKey,
      rows: cycles,
      searchValue: input.performanceCyclesSearch,
    }),
    reviewsList: buildHrPerformanceAppraisalsReviewsListSurface({
      surfaceKey: hrPerformanceAppraisalsReviewsSurfaceKey,
      cycles,
      rows: reviewRows,
      searchValue: input.performanceReviewsSearch,
    }),
    goalsList: buildHrPerformanceAppraisalsGoalsListSurface({
      surfaceKey: hrPerformanceAppraisalsGoalsSurfaceKey,
      rows: goalRows,
      searchValue: input.performanceGoalsSearch,
    }),
    approvalsList: buildHrPerformanceAppraisalsApprovalsListSurface({
      surfaceKey: hrPerformanceAppraisalsApprovalsSurfaceKey,
      rows: approvalRows,
      searchValue: input.performanceApprovalsSearch,
    }),
    outcomesList: buildHrPerformanceAppraisalsOutcomesListSurface({
      surfaceKey: hrPerformanceAppraisalsOutcomesSurfaceKey,
      rows: outcomeRows,
      searchValue: input.performanceOutcomesSearch,
    }),
    reportsList: buildHrPerformanceAppraisalsReportsListSurface({
      surfaceKey: hrPerformanceAppraisalsReportsSurfaceKey,
      rows: reportRows,
      searchValue: input.performanceReportsSearch,
    }),
    auditTrailList: input.canReadAudit
      ? buildHrPerformanceAppraisalsAuditTrailListSurface({
          surfaceKey: hrPerformanceAppraisalsAuditTrailSurfaceKey,
          rows: auditRows,
          searchValue: input.performanceAuditTrailSearch,
        })
      : null,
    reportGroupBy: input.performanceReportGroupBy,
  };
}
