export const HR_SBS_LIST_SURFACE_KEYS = [
  "hr.payroll.sbs.versions.list",
  "hr.payroll.sbs.mappings.list",
  "hr.payroll.sbs.analyses.list",
  "hr.payroll.sbs.benchmark-report.list",
  "hr.payroll.sbs.pay-equity-report.list",
  "hr.payroll.sbs.audit.list",
] as const;

export type HrSbsListSurfaceKey = (typeof HR_SBS_LIST_SURFACE_KEYS)[number];

export const hrSbsVersionsSurfaceKey = "hr.payroll.sbs.versions.list" as const;
export const hrSbsMappingsSurfaceKey = "hr.payroll.sbs.mappings.list" as const;
export const hrSbsAnalysesSurfaceKey = "hr.payroll.sbs.analyses.list" as const;
export const hrSbsBenchmarkReportSurfaceKey =
  "hr.payroll.sbs.benchmark-report.list" as const;
export const hrSbsPayEquityReportSurfaceKey =
  "hr.payroll.sbs.pay-equity-report.list" as const;
export const hrSbsAuditSurfaceKey = "hr.payroll.sbs.audit.list" as const;

export const hrSbsVersionsSearchParam = "sbsVersionsSearch";
export const hrSbsMappingsSearchParam = "sbsMappingsSearch";
export const hrSbsAnalysesSearchParam = "sbsAnalysesSearch";
export const hrSbsBenchmarkReportSearchParam = "sbsBenchmarkReportSearch";
export const hrSbsPayEquityReportSearchParam = "sbsPayEquityReportSearch";
export const hrSbsAuditSearchParam = "sbsAuditSearch";

export type HrSbsSearchParams = {
  sbsVersionsSearch?: string;
  sbsMappingsSearch?: string;
  sbsAnalysesSearch?: string;
  sbsBenchmarkReportSearch?: string;
  sbsPayEquityReportSearch?: string;
  sbsAuditSearch?: string;
};

export function parseHrSbsSearchParams(
  searchParams?: Record<string, string | string[] | undefined>,
): HrSbsSearchParams {
  const read = (key: string) => {
    const value = searchParams?.[key];
    if (Array.isArray(value)) return value[0];
    return value;
  };

  return {
    sbsVersionsSearch: read(hrSbsVersionsSearchParam),
    sbsMappingsSearch: read(hrSbsMappingsSearchParam),
    sbsAnalysesSearch: read(hrSbsAnalysesSearchParam),
    sbsBenchmarkReportSearch: read(hrSbsBenchmarkReportSearchParam),
    sbsPayEquityReportSearch: read(hrSbsPayEquityReportSearchParam),
    sbsAuditSearch: read(hrSbsAuditSearchParam),
  };
}

export function toHrSbsHubPageModelInput(input: {
  organizationId: string;
  canWrite: boolean;
  searchParams?: HrSbsSearchParams;
}) {
  return {
    organizationId: input.organizationId,
    canWrite: input.canWrite,
    versionsSearch: input.searchParams?.sbsVersionsSearch,
    mappingsSearch: input.searchParams?.sbsMappingsSearch,
  };
}

export function toHrSbsReportsPageModelInput(input: {
  organizationId: string;
  searchParams?: HrSbsSearchParams;
}) {
  return {
    organizationId: input.organizationId,
    benchmarkReportSearch: input.searchParams?.sbsBenchmarkReportSearch,
    payEquityReportSearch: input.searchParams?.sbsPayEquityReportSearch,
  };
}

export function toHrSbsAuditPageModelInput(input: {
  organizationId: string;
  searchParams?: HrSbsSearchParams;
}) {
  return {
    organizationId: input.organizationId,
    auditSearch: input.searchParams?.sbsAuditSearch,
  };
}
