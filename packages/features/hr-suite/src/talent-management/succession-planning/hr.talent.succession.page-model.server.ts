import {
  buildHrSuccessionAuditTrailListSurface,
  buildHrSuccessionBenchStrengthListSurface,
  buildHrSuccessionCalibrationReviewsListSurface,
  buildHrSuccessionCompetencyGapsListSurface,
  buildHrSuccessionCriticalRolesListSurface,
  buildHrSuccessionDevelopmentPlansListSurface,
  buildHrSuccessionLifecycleRecommendationsListSurface,
  buildHrSuccessionNotificationsListSurface,
  buildHrSuccessionReplacementPlansListSurface,
  buildHrSuccessionReportsListSurface,
  buildHrSuccessionSuccessorsListSurface,
  buildHrSuccessionTalentPoolsListSurface,
} from "./hr.talent.succession-lists.surface";
import { buildHrSuccessionOverviewStatGrid } from "./hr.talent.succession-overview-stat.surface";
import {
  hrSuccessionAuditTrailSurfaceKey,
  hrSuccessionBenchStrengthSurfaceKey,
  hrSuccessionCalibrationReviewsSurfaceKey,
  hrSuccessionCompetencyGapsSurfaceKey,
  hrSuccessionCriticalRolesSurfaceKey,
  hrSuccessionDevelopmentPlansSurfaceKey,
  hrSuccessionLifecycleRecommendationsSurfaceKey,
  hrSuccessionNotificationsSurfaceKey,
  hrSuccessionReplacementPlansSurfaceKey,
  hrSuccessionReportsSurfaceKey,
  hrSuccessionSuccessorsSurfaceKey,
  hrSuccessionTalentPoolsSurfaceKey,
  type HrSuccessionPageModelInput,
} from "./hr.talent.succession-search-params.parse.shared";
import {
  buildHrSuccessionBenchStrengthRows,
  buildHrSuccessionReportRows,
  filterHrSuccessionRecordsForAccess,
  getHrSuccessionStore,
} from "./hr.talent.succession-store.shared";

const SUCCESSION_DEFAULT_PAGE_SIZE = 25;

export type HrSuccessionPageModel = {
  canWrite: boolean;
  canReview: boolean;
  canApprove: boolean;
  canReadRestricted: boolean;
  reportGroupBy: HrSuccessionPageModelInput["reportGroupBy"];
  overview: ReturnType<typeof buildHrSuccessionOverviewStatGrid>;
  criticalRolesList: ReturnType<typeof buildHrSuccessionCriticalRolesListSurface>;
  successorsList: ReturnType<typeof buildHrSuccessionSuccessorsListSurface>;
  competencyGapsList: ReturnType<
    typeof buildHrSuccessionCompetencyGapsListSurface
  >;
  developmentPlansList: ReturnType<
    typeof buildHrSuccessionDevelopmentPlansListSurface
  >;
  talentPoolsList: ReturnType<typeof buildHrSuccessionTalentPoolsListSurface>;
  calibrationReviewsList: ReturnType<
    typeof buildHrSuccessionCalibrationReviewsListSurface
  >;
  benchStrengthList: ReturnType<
    typeof buildHrSuccessionBenchStrengthListSurface
  >;
  replacementPlansList: ReturnType<
    typeof buildHrSuccessionReplacementPlansListSurface
  >;
  notificationsList: ReturnType<
    typeof buildHrSuccessionNotificationsListSurface
  >;
  lifecycleRecommendationsList: ReturnType<
    typeof buildHrSuccessionLifecycleRecommendationsListSurface
  > | null;
  reportsList: ReturnType<typeof buildHrSuccessionReportsListSurface>;
  auditTrailList: ReturnType<typeof buildHrSuccessionAuditTrailListSurface> | null;
};

type SearchableRecord = {
  readonly id: string;
};

function filterRows<T extends SearchableRecord>(
  rows: readonly T[],
  searchValue?: string,
): T[] {
  if (!searchValue?.trim()) {
    return [...rows].slice(0, SUCCESSION_DEFAULT_PAGE_SIZE);
  }
  const needle = searchValue.trim().toLowerCase();
  return rows
    .filter((row) => JSON.stringify(row).toLowerCase().includes(needle))
    .slice(0, SUCCESSION_DEFAULT_PAGE_SIZE);
}

export async function buildHrSuccessionPageModel(
  input: HrSuccessionPageModelInput,
): Promise<HrSuccessionPageModel> {
  const store = getHrSuccessionStore(input.organizationId);
  const visibleStore = filterHrSuccessionRecordsForAccess({
    store,
    access: {
      role: input.canWrite ? "hr" : "manager",
      visibleEmployeeIds: input.visibleEmployeeIds,
      canReadRestricted: input.canReadRestricted,
      canReadAudit: input.canReadAudit,
      canExposeLifecycle: input.canExposeLifecycle,
    },
  });
  const benchRows = buildHrSuccessionBenchStrengthRows({
    store: visibleStore,
    groupBy: "role",
  });
  const reportRows = buildHrSuccessionReportRows({
    store: visibleStore,
    groupBy: input.reportGroupBy,
  });
  const overviewSnapshot = {
    criticalRoleCount: visibleStore.criticalRoles.length,
    readyNowCount: benchRows.reduce((sum, row) => sum + row.readyNowCount, 0),
    weakCoverageCount: benchRows.reduce(
      (sum, row) => sum + row.weakCoverageCount,
      0,
    ),
    noReadySuccessorCount: benchRows.reduce(
      (sum, row) => sum + row.noReadySuccessorCount,
      0,
    ),
    highRiskCount: benchRows.filter(
      (row) => row.riskLevel === "critical" || row.riskLevel === "high",
    ).length,
    overdueReviewCount: visibleStore.notifications.filter(
      (notification) => notification.type === "overdue_review",
    ).length,
  };

  return {
    canWrite: input.canWrite,
    canReview: input.canReview,
    canApprove: input.canApprove,
    canReadRestricted: input.canReadRestricted,
    reportGroupBy: input.reportGroupBy,
    overview: buildHrSuccessionOverviewStatGrid({ snapshot: overviewSnapshot }),
    criticalRolesList: buildHrSuccessionCriticalRolesListSurface({
      surfaceKey: hrSuccessionCriticalRolesSurfaceKey,
      rows: filterRows(visibleStore.criticalRoles, input.criticalRolesSearch),
      searchValue: input.criticalRolesSearch,
    }),
    successorsList: buildHrSuccessionSuccessorsListSurface({
      surfaceKey: hrSuccessionSuccessorsSurfaceKey,
      rows: filterRows(visibleStore.successors, input.successorsSearch),
      criticalRoles: visibleStore.criticalRoles,
      searchValue: input.successorsSearch,
    }),
    competencyGapsList: buildHrSuccessionCompetencyGapsListSurface({
      surfaceKey: hrSuccessionCompetencyGapsSurfaceKey,
      rows: filterRows(visibleStore.competencyGaps, input.competencyGapsSearch),
      searchValue: input.competencyGapsSearch,
    }),
    developmentPlansList: buildHrSuccessionDevelopmentPlansListSurface({
      surfaceKey: hrSuccessionDevelopmentPlansSurfaceKey,
      rows: filterRows(
        visibleStore.developmentPlans,
        input.developmentPlansSearch,
      ),
      searchValue: input.developmentPlansSearch,
    }),
    talentPoolsList: buildHrSuccessionTalentPoolsListSurface({
      surfaceKey: hrSuccessionTalentPoolsSurfaceKey,
      rows: filterRows(visibleStore.talentPools, input.talentPoolsSearch),
      searchValue: input.talentPoolsSearch,
    }),
    calibrationReviewsList: buildHrSuccessionCalibrationReviewsListSurface({
      surfaceKey: hrSuccessionCalibrationReviewsSurfaceKey,
      rows: filterRows(
        visibleStore.calibrationReviews,
        input.calibrationReviewsSearch,
      ),
      criticalRoles: visibleStore.criticalRoles,
      searchValue: input.calibrationReviewsSearch,
    }),
    benchStrengthList: buildHrSuccessionBenchStrengthListSurface({
      surfaceKey: hrSuccessionBenchStrengthSurfaceKey,
      rows: filterRows(benchRows, input.benchStrengthSearch),
      searchValue: input.benchStrengthSearch,
    }),
    replacementPlansList: buildHrSuccessionReplacementPlansListSurface({
      surfaceKey: hrSuccessionReplacementPlansSurfaceKey,
      rows: filterRows(
        visibleStore.replacementPlans,
        input.replacementPlansSearch,
      ),
      criticalRoles: visibleStore.criticalRoles,
      successors: visibleStore.successors,
      searchValue: input.replacementPlansSearch,
    }),
    notificationsList: buildHrSuccessionNotificationsListSurface({
      surfaceKey: hrSuccessionNotificationsSurfaceKey,
      rows: filterRows(visibleStore.notifications, input.notificationsSearch),
      searchValue: input.notificationsSearch,
    }),
    lifecycleRecommendationsList: input.canExposeLifecycle
      ? buildHrSuccessionLifecycleRecommendationsListSurface({
          surfaceKey: hrSuccessionLifecycleRecommendationsSurfaceKey,
          rows: filterRows(
            visibleStore.lifecycleRecommendations,
            input.lifecycleRecommendationsSearch,
          ),
          searchValue: input.lifecycleRecommendationsSearch,
        })
      : null,
    reportsList: buildHrSuccessionReportsListSurface({
      surfaceKey: hrSuccessionReportsSurfaceKey,
      rows: filterRows(reportRows, input.reportsSearch),
      searchValue: input.reportsSearch,
    }),
    auditTrailList: input.canReadAudit
      ? buildHrSuccessionAuditTrailListSurface({
          surfaceKey: hrSuccessionAuditTrailSurfaceKey,
          rows: filterRows(visibleStore.auditEvents, input.auditTrailSearch),
          searchValue: input.auditTrailSearch,
        })
      : null,
  };
}

export const buildHrSuccessionPlanningPageModel = buildHrSuccessionPageModel;
