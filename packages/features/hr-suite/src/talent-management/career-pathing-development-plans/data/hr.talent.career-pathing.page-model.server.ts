import type { HrCareerPathingOverviewKpis } from "./hr.talent.career-pathing-readiness.server";
import type { HrCareerPathingReportRow } from "./hr.talent.career-pathing.reports.shared";
import type { HrCareerPathingAuditTrailWindow } from "./hr.talent.career-pathing-audit.server";

export type HrCareerPathingReadinessListRow = {
  id: string;
  employeeNumber: string;
  employeeName: string;
  targetRoleTitle: string | null;
  readinessLevel: string;
  readinessScore: string | null;
  computedAt: Date;
};

export type HrCareerPathingOverviewPageModel = {
  kpis: HrCareerPathingOverviewKpis;
  readinessRows: readonly HrCareerPathingReadinessListRow[];
  readinessSearch?: string;
};

export type HrCareerPathingReportsPageModel = {
  rows: readonly HrCareerPathingReportRow[];
  groupBy: string;
  search?: string;
};

export type HrCareerPathingAuditPageModel = {
  window: HrCareerPathingAuditTrailWindow;
  search?: string;
};

export async function buildHrCareerPathingOverviewPageModel(input: {
  organizationId: string;
  readinessRows: readonly HrCareerPathingReadinessListRow[];
  readinessSearch?: string;
}): Promise<HrCareerPathingOverviewPageModel> {
  const { loadHrCareerPathingOverviewKpis } = await import(
    "./hr.talent.career-pathing-readiness.server"
  );
  const kpis = await loadHrCareerPathingOverviewKpis({
    organizationId: input.organizationId,
  });

  return {
    kpis,
    readinessRows: input.readinessRows,
    readinessSearch: input.readinessSearch,
  };
}

export function buildHrCareerPathingReportsPageModel(input: {
  rows: readonly HrCareerPathingReportRow[];
  groupBy: string;
  search?: string;
}): HrCareerPathingReportsPageModel {
  return {
    rows: input.rows,
    groupBy: input.groupBy,
    search: input.search,
  };
}

export function buildHrCareerPathingAuditPageModel(input: {
  window: HrCareerPathingAuditTrailWindow;
  search?: string;
}): HrCareerPathingAuditPageModel {
  return {
    window: input.window,
    search: input.search,
  };
}
