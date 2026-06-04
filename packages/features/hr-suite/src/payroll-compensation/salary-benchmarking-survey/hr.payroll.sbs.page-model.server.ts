import { listHrSalaryBenchmarkVersionsWindow } from "@afenda/db";

import {
  buildHrSbsAnalysesListSurface,
  buildHrSbsAuditListSurface,
  buildHrSbsBenchmarkReportListSurface,
  buildHrSbsMappingsListSurface,
  buildHrSbsPayEquityReportListSurface,
  buildHrSbsVersionsListSurface,
} from "./hr.payroll.sbs-lists.surface";
import {
  hrSbsAuditSurfaceKey,
  hrSbsBenchmarkReportSurfaceKey,
  hrSbsMappingsSurfaceKey,
  hrSbsPayEquityReportSurfaceKey,
  hrSbsVersionsSurfaceKey,
} from "./hr.payroll.sbs-search-params.parse.shared";
import { listHrSbsAuditEvents } from "./hrs-hr-payroll-sbs-audit-server";
import { listHrSbsCompensationAnalyses } from "./hrs-hr-payroll-sbs-analysis-server";
import { listHrSbsBenchmarkMappings } from "./hrs-hr-payroll-sbs-mapping-server";
import {
  buildHrSbsBenchmarkReportRows,
  filterHrSbsPayEquityReportRows,
  type HrSbsPayEquityReportRow,
} from "./hr.payroll.sbs-reports.shared";
import type { HrSbsAnalysisSnapshot } from "./hr.payroll.sbs-analysis.schema";

const SBS_DEFAULT_PAGE_SIZE = 25;

export type HrSbsHubPageModel = {
  versionsList: ReturnType<typeof buildHrSbsVersionsListSurface>;
  mappingsList: ReturnType<typeof buildHrSbsMappingsListSurface>;
  surfaceKeys: {
    versions: typeof hrSbsVersionsSurfaceKey;
    mappings: typeof hrSbsMappingsSurfaceKey;
  };
};

export type HrSbsReportsPageModel = {
  benchmarkReportList: ReturnType<typeof buildHrSbsBenchmarkReportListSurface>;
  payEquityReportList: ReturnType<typeof buildHrSbsPayEquityReportListSurface>;
  surfaceKeys: {
    benchmarkReport: typeof hrSbsBenchmarkReportSurfaceKey;
    payEquityReport: typeof hrSbsPayEquityReportSurfaceKey;
  };
};

export type HrSbsAuditPageModel = {
  auditList: ReturnType<typeof buildHrSbsAuditListSurface>;
  surfaceKeys: { audit: typeof hrSbsAuditSurfaceKey };
};

export async function buildHrSbsHubPageModel(input: {
  organizationId: string;
  versionsSearch?: string;
  mappingsSearch?: string;
}): Promise<HrSbsHubPageModel> {
  const [versionsWindow, mappingsWindow] = await Promise.all([
    listHrSalaryBenchmarkVersionsWindow({
      organizationId: input.organizationId,
      search: input.versionsSearch,
      limit: SBS_DEFAULT_PAGE_SIZE,
    }),
    listHrSbsBenchmarkMappings({
      organizationId: input.organizationId,
      search: input.mappingsSearch,
      limit: SBS_DEFAULT_PAGE_SIZE,
    }),
  ]);

  return {
    versionsList: buildHrSbsVersionsListSurface({
      window: versionsWindow,
      searchValue: input.versionsSearch,
    }),
    mappingsList: buildHrSbsMappingsListSurface({
      window: mappingsWindow,
      searchValue: input.mappingsSearch,
    }),
    surfaceKeys: {
      versions: hrSbsVersionsSurfaceKey,
      mappings: hrSbsMappingsSurfaceKey,
    },
  };
}

export async function buildHrSbsReportsPageModel(input: {
  organizationId: string;
}): Promise<HrSbsReportsPageModel> {
  const analysesWindow = await listHrSbsCompensationAnalyses({
    organizationId: input.organizationId,
    pageSize: 1,
  });

  const latest = analysesWindow.rows[0];
  const snapshot = latest?.snapshot as HrSbsAnalysisSnapshot | undefined;

  const benchmarkRows = snapshot
    ? buildHrSbsBenchmarkReportRows({
        employeeMetaById: Object.fromEntries(
          snapshot.employeeResults.map((row) => [
            row.employeeId,
            { jobFamily: null, grade: null, departmentId: null },
          ]),
        ),
        employeeResults: snapshot.employeeResults,
      })
    : [];

  const payEquityRows: readonly HrSbsPayEquityReportRow[] = snapshot
    ? filterHrSbsPayEquityReportRows(
        snapshot.payEquityGroups.map((group) => ({
          dimension: group.dimension,
          groupKey: group.groupKey,
          employeeCount: group.employeeCount,
          minSalary: group.minSalary,
          maxSalary: group.maxSalary,
          medianSalary: group.medianSalary,
          spreadPercent: group.disparityRatio != null ? group.disparityRatio * 100 : 0,
          flagged: group.flagged,
        })),
      )
    : [];

  return {
    benchmarkReportList: buildHrSbsBenchmarkReportListSurface({
      rows: benchmarkRows.map((row) => ({
        employeeId: row.employeeId,
        marketPosition: row.marketPosition,
        marketRatio: row.marketRatio,
        compaRatio: row.compaRatio,
      })),
    }),
    payEquityReportList: buildHrSbsPayEquityReportListSurface({
      rows: payEquityRows.map((row, index) => ({
        id: `${row.dimension}-${row.groupKey}-${index}`,
        dimension: row.dimension,
        groupKey: row.groupKey,
        employeeCount: row.employeeCount,
        spreadPercent: row.spreadPercent,
        flagged: row.flagged,
      })),
    }),
    surfaceKeys: {
      benchmarkReport: hrSbsBenchmarkReportSurfaceKey,
      payEquityReport: hrSbsPayEquityReportSurfaceKey,
    },
  };
}

export async function buildHrSbsAuditPageModel(input: {
  organizationId: string;
  auditSearch?: string;
}): Promise<HrSbsAuditPageModel> {
  const auditWindow = await listHrSbsAuditEvents({
    organizationId: input.organizationId,
    search: input.auditSearch,
    limit: SBS_DEFAULT_PAGE_SIZE,
  });

  return {
    auditList: buildHrSbsAuditListSurface({
      window: auditWindow,
      searchValue: input.auditSearch,
    }),
    surfaceKeys: { audit: hrSbsAuditSurfaceKey },
  };
}

export async function buildHrSbsAnalysesHubList(input: {
  organizationId: string;
}) {
  const analysesWindow = await listHrSbsCompensationAnalyses({
    organizationId: input.organizationId,
    pageSize: SBS_DEFAULT_PAGE_SIZE,
  });

  return buildHrSbsAnalysesListSurface({ window: analysesWindow });
}
