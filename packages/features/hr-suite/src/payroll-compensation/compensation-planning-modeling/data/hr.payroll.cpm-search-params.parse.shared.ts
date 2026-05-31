export const hrCpmCyclesSearchParam = "cpmCyclesSearch";
export const hrCpmParticipantsSearchParam = "cpmParticipantsSearch";
export const hrCpmRecommendationsSearchParam = "cpmRecommendationsSearch";
export const hrCpmReportsSearchParam = "cpmReportsSearch";
export const hrCpmAuditSearchParam = "cpmAuditSearch";
export const hrCpmReportCycleIdParam = "cpmReportCycleId";
export const hrCpmReportDepartmentParam = "cpmReportDepartmentId";
export const hrCpmReportManagerParam = "cpmReportManagerId";
export const hrCpmReportEntityParam = "cpmReportLegalEntity";
export const hrCpmReportGradeParam = "cpmReportGrade";
export const hrCpmReportPoolParam = "cpmReportBudgetPoolId";
export const hrCpmReportStatusParam = "cpmReportStatus";
export const hrCpmAuditCycleIdParam = "cpmAuditCycleId";

export const hrCpmCyclesSurfaceKey = "hr.payroll.cpm.cycles.list";
export const hrCpmParticipantsSurfaceKey = "hr.payroll.cpm.participants.list";
export const hrCpmRecommendationsSurfaceKey = "hr.payroll.cpm.recommendations.list";
export const hrCpmReportsSurfaceKey = "hr.payroll.cpm.reports.list";
export const hrCpmAuditSurfaceKey = "hr.payroll.cpm.audit.list";

export const HR_CPM_LIST_SURFACE_KEYS = [
  hrCpmCyclesSurfaceKey,
  hrCpmParticipantsSurfaceKey,
  hrCpmRecommendationsSurfaceKey,
  hrCpmReportsSurfaceKey,
  hrCpmAuditSurfaceKey,
] as const;

export type HrCpmListSurfaceKey = (typeof HR_CPM_LIST_SURFACE_KEYS)[number];

export type HrCpmSearchParams = {
  cyclesSearch?: string;
  participantsSearch?: string;
  recommendationsSearch?: string;
  reportsSearch?: string;
  auditSearch?: string;
  reportCycleId?: string;
  reportDepartmentId?: string;
  reportManagerId?: string;
  reportLegalEntity?: string;
  reportGrade?: string;
  reportBudgetPoolId?: string;
  reportStatus?: string;
  auditCycleId?: string;
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

export function parseHrCpmSearchParams(
  searchParams?: Record<string, string | string[] | undefined>,
): HrCpmSearchParams {
  if (!searchParams) {
    return {};
  }

  return {
    cyclesSearch: readSearchParam(searchParams, hrCpmCyclesSearchParam),
    participantsSearch: readSearchParam(searchParams, hrCpmParticipantsSearchParam),
    recommendationsSearch: readSearchParam(searchParams, hrCpmRecommendationsSearchParam),
    reportsSearch: readSearchParam(searchParams, hrCpmReportsSearchParam),
    auditSearch: readSearchParam(searchParams, hrCpmAuditSearchParam),
    reportCycleId: readSearchParam(searchParams, hrCpmReportCycleIdParam),
    reportDepartmentId: readSearchParam(searchParams, hrCpmReportDepartmentParam),
    reportManagerId: readSearchParam(searchParams, hrCpmReportManagerParam),
    reportLegalEntity: readSearchParam(searchParams, hrCpmReportEntityParam),
    reportGrade: readSearchParam(searchParams, hrCpmReportGradeParam),
    reportBudgetPoolId: readSearchParam(searchParams, hrCpmReportPoolParam),
    reportStatus: readSearchParam(searchParams, hrCpmReportStatusParam),
    auditCycleId: readSearchParam(searchParams, hrCpmAuditCycleIdParam),
  };
}

export function toHrCpmHubPageModelInput(input: {
  organizationId: string;
  canWrite: boolean;
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const parsed = parseHrCpmSearchParams(input.searchParams);
  return {
    organizationId: input.organizationId,
    canWrite: input.canWrite,
    cyclesSearch: parsed.cyclesSearch,
  };
}

export function toHrCpmCycleDetailPageModelInput(input: {
  organizationId: string;
  canWrite: boolean;
  cycleId: string;
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const parsed = parseHrCpmSearchParams(input.searchParams);
  return {
    organizationId: input.organizationId,
    canWrite: input.canWrite,
    cycleId: input.cycleId,
    participantsSearch: parsed.participantsSearch,
    recommendationsSearch: parsed.recommendationsSearch,
  };
}

export function toHrCpmReportsPageModelInput(input: {
  organizationId: string;
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const parsed = parseHrCpmSearchParams(input.searchParams);
  return {
    organizationId: input.organizationId,
    reportsSearch: parsed.reportsSearch,
    reportFilter: {
      cycleId: parsed.reportCycleId ?? null,
      departmentId: parsed.reportDepartmentId ?? null,
      managerEmployeeId: parsed.reportManagerId ?? null,
      legalEntityCode: parsed.reportLegalEntity ?? null,
      grade: parsed.reportGrade ?? null,
      budgetPoolId: parsed.reportBudgetPoolId ?? null,
      recommendationStatus: parsed.reportStatus ?? null,
    },
  };
}

export function toHrCpmAuditPageModelInput(input: {
  organizationId: string;
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const parsed = parseHrCpmSearchParams(input.searchParams);
  return {
    organizationId: input.organizationId,
    auditSearch: parsed.auditSearch,
    cycleId: parsed.auditCycleId ?? null,
  };
}
