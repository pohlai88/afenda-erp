import type { EmptyState } from "@afenda/governed-surface/schemas";

import { queryHrAatAbsenceAnalytics } from "./hrs-hr-time-aat-analytics-core-server";
import { listHrAatAuditTrailWindow } from "./hrs-hr-time-aat-audit-server";
import {
  listHrAatRiskNotifications,
  syncHrAatRiskThresholdNotifications,
} from "./hrs-hr-time-aat-notifications-server";
import {
  listHrAatAnalyticsSnapshots,
  persistHrAatAnalyticsSnapshotFromResult,
  recordHrAatAnalyticsGeneration,
} from "./hrs-hr-time-aat-snapshots-server";
import { listHrAatAbsenceRiskIndicators } from "./hrs-hr-time-aat-risk-server";
import type { HrAatPageModelInput } from "./hr.time.aat-search-params.parse.shared";
import { defaultPeriodRange } from "./hr.time.aat-search-params.parse.shared";
import { buildHrAatAuditTrailListSurface } from "./hr.time.aat-audit-trail-list.surface";
import { buildHrAatNotificationsListSurface } from "./hr.time.aat-notifications-list.surface";
import { buildHrAatOverviewStatGrid } from "./hr.time.aat-overview-stat.surface";
import { buildHrAatRiskIndicatorsListSurface } from "./hr.time.aat-risk-indicators-list.surface";
import { buildHrAatSnapshotsListSurface } from "./hr.time.aat-snapshots-list.surface";
import {
  hrAatAuditTrailSurfaceKey,
  hrAatNotificationsSurfaceKey,
  hrAatOverviewStatSurfaceKey,
  hrAatRiskIndicatorsSurfaceKey,
  hrAatSnapshotsSurfaceKey,
} from "./hr.time.aat-surface-metadata.shared";

const AAT_DEFAULT_PAGE_SIZE = 25;

export type HrAatPageModel = {
  canViewRiskIndicators: boolean;
  canViewAudit: boolean;
  overviewStats: ReturnType<typeof buildHrAatOverviewStatGrid>;
  riskIndicators?: ReturnType<typeof buildHrAatRiskIndicatorsListSurface>;
  riskIndicatorsLoadError?: EmptyState;
  snapshots: ReturnType<typeof buildHrAatSnapshotsListSurface>;
  snapshotsLoadError?: EmptyState;
  notifications: ReturnType<typeof buildHrAatNotificationsListSurface>;
  notificationsLoadError?: EmptyState;
  auditTrail?: ReturnType<typeof buildHrAatAuditTrailListSurface>;
  auditTrailLoadError?: EmptyState;
  surfaceKeys: {
    overview: typeof hrAatOverviewStatSurfaceKey;
    riskIndicators: typeof hrAatRiskIndicatorsSurfaceKey;
    snapshots: typeof hrAatSnapshotsSurfaceKey;
    notifications: typeof hrAatNotificationsSurfaceKey;
    auditTrail: typeof hrAatAuditTrailSurfaceKey;
  };
};

export async function buildHrAatPageModel(
  input: HrAatPageModelInput,
): Promise<HrAatPageModel> {
  const { periodStart, periodEnd } = defaultPeriodRange();
  const visibleEmployeeIds = null;

  let atRiskEmployeeCount = 0;
  let absenceRatePercent = 0;
  let totalLostWorkdays = 0;
  let riskIndicatorsList: ReturnType<
    typeof buildHrAatRiskIndicatorsListSurface
  > | undefined;
  let riskIndicatorsLoadError: EmptyState | undefined;

  if (input.canViewRiskIndicators) {
    try {
      const riskResult = await listHrAatAbsenceRiskIndicators({
        organizationId: input.organizationId,
        query: {
          organizationId: input.organizationId,
          periodStart,
          periodEnd,
        },
        visibleEmployeeIds,
      });

      atRiskEmployeeCount = riskResult.indicators.filter(
        (row) => row.riskLevel !== "normal" && row.riskLevel !== "watch",
      ).length;

      riskIndicatorsList = buildHrAatRiskIndicatorsListSurface({
        result: riskResult,
        searchValue: input.riskIndicatorsSearch,
      });

      await syncHrAatRiskThresholdNotifications({
        organizationId: input.organizationId,
        actorAuthUserId: input.actorAuthUserId,
        indicators: riskResult.indicators,
      });
    } catch {
      riskIndicatorsLoadError = {
        variant: "error",
        title: "Risk indicators unavailable",
        description: "Could not load absence risk indicators for this period.",
      };
    }
  }

  try {
    const analytics = await queryHrAatAbsenceAnalytics({
      organizationId: input.organizationId,
      query: {
        dimension: "employee",
        periodStart,
        periodEnd,
      },
    });

    absenceRatePercent = analytics.totals.absenceRatePercent;
    totalLostWorkdays = analytics.totals.totalLostWorkdays;

    await recordHrAatAnalyticsGeneration({
      organizationId: input.organizationId,
      actorAuthUserId: input.actorAuthUserId,
      dimension: analytics.dimension,
      periodStart: analytics.periodStart,
      periodEnd: analytics.periodEnd,
      employeeCount: analytics.totals.employeeCount,
      absenceRatePercent: analytics.totals.absenceRatePercent,
    });

    await persistHrAatAnalyticsSnapshotFromResult({
      organizationId: input.organizationId,
      periodKind: "monthly",
      snapshot: analytics,
      generatedByAuthUserId: input.actorAuthUserId,
    });
  } catch {
    // Overview still renders from partial data when analytics query fails.
  }

  let snapshotsWindow;
  let snapshotsLoadError: EmptyState | undefined;
  try {
    snapshotsWindow = await listHrAatAnalyticsSnapshots({
      organizationId: input.organizationId,
      limit: AAT_DEFAULT_PAGE_SIZE,
      search: input.snapshotsSearch,
    });
  } catch {
    snapshotsWindow = {
      rows: [],
      pageSize: AAT_DEFAULT_PAGE_SIZE,
      totalCount: 0,
      hasNextPage: false,
    };
    snapshotsLoadError = {
      variant: "error",
      title: "Snapshots unavailable",
      description: "Could not load historical analytics snapshots.",
    };
  }

  let notificationsWindow;
  let notificationsLoadError: EmptyState | undefined;
  try {
    notificationsWindow = await listHrAatRiskNotifications({
      organizationId: input.organizationId,
      limit: AAT_DEFAULT_PAGE_SIZE,
      search: input.notificationsSearch,
    });
  } catch {
    notificationsWindow = {
      rows: [],
      pageSize: AAT_DEFAULT_PAGE_SIZE,
      totalCount: 0,
      hasNextPage: false,
    };
    notificationsLoadError = {
      variant: "error",
      title: "Notifications unavailable",
      description: "Could not load absence risk notifications.",
    };
  }

  let auditTrailList: ReturnType<typeof buildHrAatAuditTrailListSurface> | undefined;
  let auditTrailLoadError: EmptyState | undefined;

  if (input.canViewAudit) {
    try {
      const auditWindow = await listHrAatAuditTrailWindow({
        organizationId: input.organizationId,
        limit: AAT_DEFAULT_PAGE_SIZE,
        search: input.auditTrailSearch,
      });
      auditTrailList = buildHrAatAuditTrailListSurface({
        window: auditWindow,
        searchValue: input.auditTrailSearch,
      });
    } catch {
      auditTrailLoadError = {
        variant: "error",
        title: "Audit trail unavailable",
        description: "Could not load absence analytics audit history.",
      };
    }
  }

  return {
    canViewRiskIndicators: input.canViewRiskIndicators,
    canViewAudit: input.canViewAudit,
    overviewStats: buildHrAatOverviewStatGrid({
      absenceRatePercent,
      totalLostWorkdays,
      atRiskEmployeeCount,
      snapshotCount: snapshotsWindow.totalCount,
    }),
    riskIndicators: riskIndicatorsList,
    riskIndicatorsLoadError,
    snapshots: buildHrAatSnapshotsListSurface({
      window: snapshotsWindow,
      searchValue: input.snapshotsSearch,
    }),
    snapshotsLoadError,
    notifications: buildHrAatNotificationsListSurface({
      window: notificationsWindow,
      searchValue: input.notificationsSearch,
    }),
    notificationsLoadError,
    auditTrail: auditTrailList,
    auditTrailLoadError,
    surfaceKeys: {
      overview: hrAatOverviewStatSurfaceKey,
      riskIndicators: hrAatRiskIndicatorsSurfaceKey,
      snapshots: hrAatSnapshotsSurfaceKey,
      notifications: hrAatNotificationsSurfaceKey,
      auditTrail: hrAatAuditTrailSurfaceKey,
    },
  };
}
