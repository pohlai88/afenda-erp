import type { SbsEmployeeAnalysisResult } from "./hr.payroll.sbs-calculations.shared";

export type HrSbsBenchmarkReportFilter = {
  jobFamily?: string;
  grade?: string;
  departmentId?: string;
  legalEntityCode?: string;
  country?: string;
  locationCode?: string;
  marketPosition?: string;
};

export type HrSbsBenchmarkReportRow = {
  employeeId: string;
  jobFamily: string | null;
  grade: string | null;
  departmentId: string | null;
  legalEntityCode: string | null;
  country: string | null;
  locationCode: string | null;
  marketPosition: string;
  marketRatio: number | null;
  compaRatio: number | null;
  belowTarget: boolean;
  aboveRange: boolean;
};

export type HrSbsPayEquityReportRow = {
  dimension: string;
  groupKey: string;
  employeeCount: number;
  minSalary: number;
  maxSalary: number;
  medianSalary: number;
  spreadPercent: number;
  flagged: boolean;
};

export function buildHrSbsBenchmarkReportRows(input: {
  employeeMetaById: Readonly<
    Record<
      string,
      {
        jobFamily?: string | null;
        grade?: string | null;
        departmentId?: string | null;
        legalEntityCode?: string | null;
        country?: string | null;
        locationCode?: string | null;
      }
    >
  >;
  employeeResults: readonly SbsEmployeeAnalysisResult[];
  filter?: HrSbsBenchmarkReportFilter;
}): readonly HrSbsBenchmarkReportRow[] {
  const filter = input.filter ?? {};

  return input.employeeResults
    .map((result) => {
      const meta = input.employeeMetaById[result.employeeId] ?? {};
      return {
        employeeId: result.employeeId,
        jobFamily: meta.jobFamily ?? null,
        grade: meta.grade ?? null,
        departmentId: meta.departmentId ?? null,
        legalEntityCode: meta.legalEntityCode ?? null,
        country: meta.country ?? null,
        locationCode: meta.locationCode ?? null,
        marketPosition: result.marketPosition,
        marketRatio: result.marketRatio,
        compaRatio: result.compaRatio,
        belowTarget: result.belowTarget,
        aboveRange: result.aboveRange,
      };
    })
    .filter((row) => {
      if (filter.jobFamily && row.jobFamily !== filter.jobFamily) return false;
      if (filter.grade && row.grade !== filter.grade) return false;
      if (filter.departmentId && row.departmentId !== filter.departmentId) return false;
      if (filter.legalEntityCode && row.legalEntityCode !== filter.legalEntityCode) return false;
      if (filter.country && row.country !== filter.country) return false;
      if (filter.locationCode && row.locationCode !== filter.locationCode) return false;
      if (filter.marketPosition && row.marketPosition !== filter.marketPosition) return false;
      return true;
    });
}

export function filterHrSbsPayEquityReportRows(
  rows: readonly HrSbsPayEquityReportRow[],
  filter?: { dimension?: string; flaggedOnly?: boolean },
): readonly HrSbsPayEquityReportRow[] {
  return rows.filter((row) => {
    if (filter?.dimension && row.dimension !== filter.dimension) return false;
    if (filter?.flaggedOnly && !row.flagged) return false;
    return true;
  });
}

export function buildHrSbsBenchmarkReportCsv(rows: readonly HrSbsBenchmarkReportRow[]): string {
  const header = [
    "employeeId",
    "jobFamily",
    "grade",
    "departmentId",
    "legalEntityCode",
    "country",
    "locationCode",
    "marketPosition",
    "marketRatio",
    "compaRatio",
    "belowTarget",
    "aboveRange",
  ];
  const lines = rows.map((row) =>
    [
      row.employeeId,
      row.jobFamily ?? "",
      row.grade ?? "",
      row.departmentId ?? "",
      row.legalEntityCode ?? "",
      row.country ?? "",
      row.locationCode ?? "",
      row.marketPosition,
      row.marketRatio ?? "",
      row.compaRatio ?? "",
      row.belowTarget,
      row.aboveRange,
    ]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(","),
  );
  return [header.join(","), ...lines].join("\n");
}
