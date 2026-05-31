import {
  hrSbsAnalysesSurfaceKey,
  hrSbsAuditSearchParam,
  hrSbsAuditSurfaceKey,
  hrSbsBenchmarkReportSurfaceKey,
  hrSbsMappingsSearchParam,
  hrSbsMappingsSurfaceKey,
  hrSbsPayEquityReportSurfaceKey,
  hrSbsVersionsSearchParam,
  hrSbsVersionsSurfaceKey,
} from "../data/hr.payroll.sbs-search-params.parse.shared";
import {
  buildSbsListSearchToolbar,
  buildSbsOperationalListSurface,
  formatSbsEnumLabel,
} from "./hr.payroll.sbs-list.shared";
import {
  hrSbsAnalysesColumnsId,
  hrSbsAuditColumnsId,
  hrSbsBenchmarkReportColumnsId,
  hrSbsMappingsColumnsId,
  hrSbsPayEquityReportColumnsId,
  hrSbsUiCopy,
  hrSbsVersionsColumnsId,
} from "./hr.payroll.sbs-ui.copy.shared";

export {
  hrSbsVersionsSurfaceKey,
  hrSbsMappingsSurfaceKey,
  hrSbsAnalysesSurfaceKey,
  hrSbsBenchmarkReportSurfaceKey,
  hrSbsPayEquityReportSurfaceKey,
  hrSbsAuditSurfaceKey,
};

export function buildHrSbsVersionsListSurface(input: {
  window: {
    rows: readonly {
      id: string;
      code: string;
      label: string;
      provider: string;
      surveyYear: number;
      versionStatus: string;
      effectiveDate: Date;
    }[];
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
  };
  searchValue?: string;
}) {
  const copy = hrSbsUiCopy.versions;
  return buildSbsOperationalListSurface({
    primaryColumnId: "label",
    searchToolbar: buildSbsListSearchToolbar({
      param: hrSbsVersionsSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: {
      pageSize: input.window.pageSize,
      totalCount: input.window.totalCount,
      hasNextPage: input.window.hasNextPage,
    },
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrSbsVersionsColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "code", header: copy.colCode, pin: "start", cellKind: { kind: "text" } },
      { id: "label", header: copy.colLabel, priority: "primary", cellKind: { kind: "text" } },
      { id: "provider", header: copy.colProvider, cellKind: { kind: "text" } },
      { id: "surveyYear", header: copy.colYear, cellKind: { kind: "text" } },
      { id: "versionStatus", header: copy.colStatus, cellKind: { kind: "badge", tone: "default" } },
      { id: "effectiveDate", header: copy.colEffective, cellKind: { kind: "date" } },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        code: row.code,
        label: row.label,
        provider: row.provider,
        surveyYear: String(row.surveyYear),
        versionStatus: formatSbsEnumLabel(row.versionStatus),
        effectiveDate: row.effectiveDate.toISOString(),
      },
    })),
  });
}

export function buildHrSbsMappingsListSurface(input: {
  window: {
    rows: readonly {
      id: string;
      jobFamily: string | null;
      jobTitle: string | null;
      grade: string | null;
      locationCode: string | null;
      mappingStatus: string;
    }[];
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
  };
  searchValue?: string;
}) {
  const copy = hrSbsUiCopy.mappings;
  return buildSbsOperationalListSurface({
    primaryColumnId: "jobFamily",
    searchToolbar: buildSbsListSearchToolbar({
      param: hrSbsMappingsSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: {
      pageSize: input.window.pageSize,
      totalCount: input.window.totalCount,
      hasNextPage: input.window.hasNextPage,
    },
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrSbsMappingsColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "jobFamily", header: copy.colJobFamily, priority: "primary", cellKind: { kind: "text" } },
      { id: "jobTitle", header: copy.colJobTitle, cellKind: { kind: "text" } },
      { id: "grade", header: copy.colGrade, cellKind: { kind: "text" } },
      { id: "locationCode", header: copy.colLocation, cellKind: { kind: "text" } },
      { id: "mappingStatus", header: copy.colStatus, cellKind: { kind: "badge", tone: "default" } },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        jobFamily: row.jobFamily ?? "—",
        jobTitle: row.jobTitle ?? "—",
        grade: row.grade ?? "—",
        locationCode: row.locationCode ?? "—",
        mappingStatus: formatSbsEnumLabel(row.mappingStatus),
      },
    })),
  });
}

export function buildHrSbsAnalysesListSurface(input: {
  window: {
    rows: readonly {
      analysisId: string;
      label: string | null;
      analyzedEmployeeCount: number;
      flaggedBelowTargetCount: number;
      flaggedAboveRangeCount: number;
      createdAt: string;
    }[];
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
  };
}) {
  const copy = hrSbsUiCopy.analyses;
  return buildSbsOperationalListSurface({
    primaryColumnId: "label",
    window: {
      pageSize: input.window.pageSize,
      totalCount: input.window.totalCount,
      hasNextPage: input.window.hasNextPage,
    },
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrSbsAnalysesColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "label", header: copy.colLabel, priority: "primary", cellKind: { kind: "text" } },
      { id: "analyzedEmployeeCount", header: copy.colEmployees, cellKind: { kind: "text" } },
      { id: "flaggedBelowTargetCount", header: copy.colBelowTarget, cellKind: { kind: "text" } },
      { id: "flaggedAboveRangeCount", header: copy.colAboveRange, cellKind: { kind: "text" } },
      { id: "createdAt", header: copy.colCreated, cellKind: { kind: "date" } },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.analysisId,
      cells: {
        label: row.label ?? row.analysisId,
        analyzedEmployeeCount: String(row.analyzedEmployeeCount),
        flaggedBelowTargetCount: String(row.flaggedBelowTargetCount),
        flaggedAboveRangeCount: String(row.flaggedAboveRangeCount),
        createdAt: row.createdAt,
      },
    })),
  });
}

export function buildHrSbsBenchmarkReportListSurface(input: {
  rows: readonly {
    employeeId: string;
    marketPosition: string;
    marketRatio: number | null;
    compaRatio: number | null;
  }[];
}) {
  const copy = hrSbsUiCopy.reports;
  return buildSbsOperationalListSurface({
    primaryColumnId: "employeeId",
    window: { pageSize: input.rows.length || 25, totalCount: input.rows.length, hasNextPage: false },
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrSbsBenchmarkReportColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "employeeId", header: copy.colEmployee, priority: "primary", cellKind: { kind: "text" } },
      { id: "marketPosition", header: copy.colMarketPosition, cellKind: { kind: "badge", tone: "default" } },
      { id: "marketRatio", header: copy.colMarketRatio, cellKind: { kind: "text" } },
      { id: "compaRatio", header: copy.colCompaRatio, cellKind: { kind: "text" } },
    ],
    rows: input.rows.map((row) => ({
      id: row.employeeId,
      cells: {
        employeeId: row.employeeId,
        marketPosition: formatSbsEnumLabel(row.marketPosition),
        marketRatio: row.marketRatio != null ? `${row.marketRatio}%` : "—",
        compaRatio: row.compaRatio != null ? `${row.compaRatio}%` : "—",
      },
    })),
  });
}

export function buildHrSbsPayEquityReportListSurface(input: {
  rows: readonly {
    id: string;
    dimension: string;
    groupKey: string;
    employeeCount: number;
    spreadPercent: number;
    flagged: boolean;
  }[];
}) {
  const copy = hrSbsUiCopy.reports;
  return buildSbsOperationalListSurface({
    primaryColumnId: "groupKey",
    window: { pageSize: input.rows.length || 25, totalCount: input.rows.length, hasNextPage: false },
    surface: {
      headerTitle: copy.payEquityHeaderTitle,
      columnsId: hrSbsPayEquityReportColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "dimension", header: "Dimension", cellKind: { kind: "text" } },
      { id: "groupKey", header: "Group", priority: "primary", cellKind: { kind: "text" } },
      { id: "employeeCount", header: "Employees", cellKind: { kind: "text" } },
      { id: "spreadPercent", header: "Spread %", cellKind: { kind: "text" } },
      { id: "flagged", header: "Flagged", cellKind: { kind: "badge", tone: "default" } },
    ],
    rows: input.rows.map((row) => ({
      id: row.id,
      cells: {
        dimension: formatSbsEnumLabel(row.dimension),
        groupKey: row.groupKey,
        employeeCount: String(row.employeeCount),
        spreadPercent: `${row.spreadPercent}%`,
        flagged: row.flagged ? "Yes" : "No",
      },
    })),
  });
}

export function buildHrSbsAuditListSurface(input: {
  window: {
    rows: readonly {
      id: string;
      action: string;
      summary: string | null;
      actorUserId: string;
      occurredAt: Date;
    }[];
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
  };
  searchValue?: string;
}) {
  const copy = hrSbsUiCopy.audit;
  return buildSbsOperationalListSurface({
    primaryColumnId: "action",
    searchToolbar: buildSbsListSearchToolbar({
      param: hrSbsAuditSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: {
      pageSize: input.window.pageSize,
      totalCount: input.window.totalCount,
      hasNextPage: input.window.hasNextPage,
    },
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrSbsAuditColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      { id: "action", header: copy.colAction, priority: "primary", cellKind: { kind: "text" } },
      { id: "summary", header: copy.colSummary, cellKind: { kind: "text" } },
      { id: "actorUserId", header: copy.colActor, cellKind: { kind: "text" } },
      { id: "occurredAt", header: copy.colOccurred, cellKind: { kind: "date" } },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        action: row.action,
        summary: row.summary ?? "—",
        actorUserId: row.actorUserId,
        occurredAt:
          row.occurredAt instanceof Date
            ? row.occurredAt.toISOString()
            : String(row.occurredAt),
      },
    })),
  });
}
