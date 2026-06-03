import {
  getHrCompensationCycleSummary,
  listHrCompensationAuditTrailWindow,
  listHrCompensationCyclesWindow,
  listHrCompensationParticipantsWindow,
  listHrCompensationRecommendationsWindow,
} from "@afenda/db";

import {
  buildHrCpmAuditListSurface,
  buildHrCpmCyclesListSurface,
  buildHrCpmParticipantsListSurface,
  buildHrCpmRecommendationsListSurface,
  buildHrCpmReportsListSurface,
} from "./hr.payroll.cpm-lists.surface";
import {
  hrCpmAuditSurfaceKey,
  hrCpmCyclesSurfaceKey,
  hrCpmParticipantsSurfaceKey,
  hrCpmRecommendationsSurfaceKey,
  hrCpmReportsSurfaceKey,
} from "./hr.payroll.cpm-search-params.parse.shared";
import {
  filterHrCompensationPlanningReportRows,
  listHrCompensationPlanningReportRows,
  type HrCompensationPlanningReportFilter,
} from "./hr.payroll.cpm-reports.shared";

const CPM_DEFAULT_PAGE_SIZE = 25;

export type HrCpmHubPageModel = {
  cyclesList: ReturnType<typeof buildHrCpmCyclesListSurface>;
  surfaceKeys: { cycles: typeof hrCpmCyclesSurfaceKey };
};

export type HrCpmCycleDetailPageModel = {
  cycle: NonNullable<Awaited<ReturnType<typeof getHrCompensationCycleSummary>>>;
  participantsList: ReturnType<typeof buildHrCpmParticipantsListSurface>;
  recommendationsList: ReturnType<typeof buildHrCpmRecommendationsListSurface>;
  surfaceKeys: {
    participants: typeof hrCpmParticipantsSurfaceKey;
    recommendations: typeof hrCpmRecommendationsSurfaceKey;
  };
};

export type HrCpmReportsPageModel = {
  reportsList: ReturnType<typeof buildHrCpmReportsListSurface>;
  reportFilter: HrCompensationPlanningReportFilter;
  surfaceKeys: { reports: typeof hrCpmReportsSurfaceKey };
};

export type HrCpmAuditPageModel = {
  auditList: ReturnType<typeof buildHrCpmAuditListSurface>;
  surfaceKeys: { audit: typeof hrCpmAuditSurfaceKey };
};

export async function buildHrCpmHubPageModel(input: {
  organizationId: string;
  cyclesSearch?: string;
}): Promise<HrCpmHubPageModel> {
  const cyclesWindow = await listHrCompensationCyclesWindow({
    organizationId: input.organizationId,
    limit: CPM_DEFAULT_PAGE_SIZE,
    search: input.cyclesSearch,
  });

  return {
    cyclesList: buildHrCpmCyclesListSurface({
      window: cyclesWindow,
      searchValue: input.cyclesSearch,
    }),
    surfaceKeys: { cycles: hrCpmCyclesSurfaceKey },
  };
}

export async function buildHrCpmCycleDetailPageModel(input: {
  organizationId: string;
  cycleId: string;
  participantsSearch?: string;
  recommendationsSearch?: string;
}): Promise<HrCpmCycleDetailPageModel | null> {
  const [cycle, participantsWindow, recommendationsWindow] = await Promise.all([
    getHrCompensationCycleSummary({
      organizationId: input.organizationId,
      cycleId: input.cycleId,
    }),
    listHrCompensationParticipantsWindow({
      organizationId: input.organizationId,
      cycleId: input.cycleId,
      limit: CPM_DEFAULT_PAGE_SIZE,
      search: input.participantsSearch,
    }),
    listHrCompensationRecommendationsWindow({
      organizationId: input.organizationId,
      cycleId: input.cycleId,
      limit: CPM_DEFAULT_PAGE_SIZE,
      search: input.recommendationsSearch,
    }),
  ]);

  if (!cycle) {
    return null;
  }

  return {
    cycle,
    participantsList: buildHrCpmParticipantsListSurface({
      window: participantsWindow,
      searchValue: input.participantsSearch,
    }),
    recommendationsList: buildHrCpmRecommendationsListSurface({
      window: recommendationsWindow,
      searchValue: input.recommendationsSearch,
    }),
    surfaceKeys: {
      participants: hrCpmParticipantsSurfaceKey,
      recommendations: hrCpmRecommendationsSurfaceKey,
    },
  };
}

export async function buildHrCpmReportsPageModel(input: {
  organizationId: string;
  reportsSearch?: string;
  reportFilter: HrCompensationPlanningReportFilter;
}): Promise<HrCpmReportsPageModel> {
  const rawRows = await listHrCompensationPlanningReportRows({
    organizationId: input.organizationId,
    cycleId: input.reportFilter.cycleId ?? undefined,
  });

  const filteredRows = filterHrCompensationPlanningReportRows(
    rawRows,
    input.reportFilter,
    input.reportsSearch,
  );

  const pageSize = CPM_DEFAULT_PAGE_SIZE;
  const reportsWindow = {
    rows: filteredRows.slice(0, pageSize),
    pageSize,
    totalCount: filteredRows.length,
    hasNextPage: filteredRows.length > pageSize,
  };

  return {
    reportsList: buildHrCpmReportsListSurface({
      window: reportsWindow,
      searchValue: input.reportsSearch,
    }),
    reportFilter: input.reportFilter,
    surfaceKeys: { reports: hrCpmReportsSurfaceKey },
  };
}

export async function buildHrCpmAuditPageModel(input: {
  organizationId: string;
  auditSearch?: string;
  cycleId?: string | null;
}): Promise<HrCpmAuditPageModel> {
  const auditWindow = await listHrCompensationAuditTrailWindow({
    organizationId: input.organizationId,
    limit: CPM_DEFAULT_PAGE_SIZE,
    search: input.auditSearch,
    cycleId: input.cycleId,
  });

  return {
    auditList: buildHrCpmAuditListSurface({
      window: auditWindow,
      searchValue: input.auditSearch,
    }),
    surfaceKeys: { audit: hrCpmAuditSurfaceKey },
  };
}
