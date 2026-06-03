export const hrSbsUiCopy = {
  page: {
    title: "Salary Benchmarking & Surveys",
    description:
      "Compare internal compensation against market survey data, manage benchmark mappings, and review pay equity.",
  },
  accessDenied: {
    title: "Access restricted",
    description: "You do not have permission to view salary benchmarking data.",
  },
  versions: {
    surfaceHeaderTitle: "Benchmark versions",
    searchLabel: "Search versions",
    searchPlaceholder: "Provider, code, or label",
    colCode: "Code",
    colLabel: "Label",
    colProvider: "Provider",
    colYear: "Year",
    colStatus: "Status",
    colEffective: "Effective",
    emptyTitle: "No benchmark versions",
    emptyDescription: "Upload a salary survey to create the first benchmark version.",
  },
  mappings: {
    surfaceHeaderTitle: "Benchmark mappings",
    searchLabel: "Search mappings",
    searchPlaceholder: "Job family, title, or grade",
    colJobFamily: "Job family",
    colJobTitle: "Job title",
    colGrade: "Grade",
    colStatus: "Status",
    colLocation: "Location",
    emptyTitle: "No benchmark mappings",
    emptyDescription: "Map internal jobs and grades to external benchmark entries.",
  },
  analyses: {
    surfaceHeaderTitle: "Compensation analyses",
    colLabel: "Label",
    colEmployees: "Employees",
    colBelowTarget: "Below target",
    colAboveRange: "Above range",
    colCreated: "Created",
    emptyTitle: "No analyses yet",
    emptyDescription: "Run a compensation analysis against an approved benchmark version.",
  },
  reports: {
    surfaceHeaderTitle: "Benchmarking reports",
    payEquityHeaderTitle: "Pay equity reports",
    colEmployee: "Employee",
    colMarketPosition: "Market position",
    colMarketRatio: "Market ratio",
    colCompaRatio: "Compa-ratio",
    emptyTitle: "No report rows",
    emptyDescription: "Run an analysis to populate benchmarking and pay equity reports.",
  },
  audit: {
    surfaceHeaderTitle: "Audit trail",
    searchLabel: "Search audit",
    searchPlaceholder: "Action or summary",
    colAction: "Action",
    colSummary: "Summary",
    colActor: "Actor",
    colOccurred: "Occurred",
    emptyTitle: "No audit events",
    emptyDescription: "Survey uploads, mappings, analyses, and approvals appear here.",
  },
} as const;

export const hrSbsVersionsColumnsId = "hr.payroll.sbs.versions.columns";
export const hrSbsMappingsColumnsId = "hr.payroll.sbs.mappings.columns";
export const hrSbsAnalysesColumnsId = "hr.payroll.sbs.analyses.columns";
export const hrSbsBenchmarkReportColumnsId = "hr.payroll.sbs.benchmark-report.columns";
export const hrSbsPayEquityReportColumnsId = "hr.payroll.sbs.pay-equity-report.columns";
export const hrSbsAuditColumnsId = "hr.payroll.sbs.audit.columns";
