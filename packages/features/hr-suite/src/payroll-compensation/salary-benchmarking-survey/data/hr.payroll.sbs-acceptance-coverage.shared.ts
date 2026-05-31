/** HRM-SBS-001 … HRM-SBS-028 requirement coverage (code-verified). */
export type SbsCoverageStatus = "shipped" | "partial" | "deferred";

export type SbsRequirementCoverage = {
  readonly code: `HRM-SBS-${string}`;
  readonly status: SbsCoverageStatus;
  readonly evidence: readonly string[];
};

export const SBS_REQUIREMENT_COVERAGE: readonly SbsRequirementCoverage[] = [
  {
    code: "HRM-SBS-001",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr-salary-benchmarking.ts (hr_sbs_benchmark_versions, hr_sbs_benchmark_entries)",
      "packages/db/src/hr-salary-benchmarking-survey.ts (uploadHrSalaryBenchmarkSurveyInTx)",
      "packages/features/hr-suite/.../data/hr.payroll.sbs-survey-data.server.ts",
    ],
  },
  {
    code: "HRM-SBS-002",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr-salary-benchmarking.ts (provider, survey_year, industry, country, location, job_family, job_level, currency_code)",
      "packages/features/hr-suite/.../schemas/hr.payroll.sbs-survey-upload.schema.ts",
    ],
  },
  {
    code: "HRM-SBS-003",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr-salary-benchmarking.ts (salary min/max/median/average/midpoint, percentiles)",
      "packages/features/hr-suite/.../schemas/hr.payroll.sbs-benchmark-values.schema.ts",
    ],
  },
  {
    code: "HRM-SBS-004",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr-salary-benchmarking.ts (percentile_25/50/75/90)",
      "packages/features/hr-suite/.../schemas/hr.payroll.sbs-benchmark-values.schema.ts",
    ],
  },
  {
    code: "HRM-SBS-005",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr-salary-benchmarking.ts (hr_sbs_benchmark_mappings)",
      "packages/db/src/hr-salary-benchmarking-mapping.ts (createHrSbsBenchmarkMappingInTx)",
      "packages/features/hr-suite/.../data/hr.payroll.sbs-mapping.server.ts",
    ],
  },
  {
    code: "HRM-SBS-006",
    status: "shipped",
    evidence: [
      "hr_sbs_benchmark_mappings.grade + benchmark entry job_level",
      "packages/features/hr-suite/.../schemas/hr.payroll.sbs-mapping.schema.ts",
    ],
  },
  {
    code: "HRM-SBS-007",
    status: "shipped",
    evidence: [
      "mapping dimensions: legal_entity_code, country, location_code, job_family, job_title, grade, employment_category",
      "packages/db/src/hr-salary-benchmarking-mapping.ts",
    ],
  },
  {
    code: "HRM-SBS-008",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr-salary-benchmarking.ts (hr_sbs_mapping_approvals, mapping_status)",
      "packages/db/src/hr-salary-benchmarking-mapping.ts (submit/review approval workflow)",
      "packages/features/hr-suite/.../actions/hr.payroll.sbs.actions.server.ts",
    ],
  },
  {
    code: "HRM-SBS-009",
    status: "shipped",
    evidence: [
      "packages/features/hr-suite/.../data/hr.payroll.sbs-calculations.shared.ts (compareBaseSalary)",
      "packages/features/hr-suite/.../data/hr.payroll.sbs-analysis.server.ts",
    ],
  },
  {
    code: "HRM-SBS-010",
    status: "shipped",
    evidence: ["compareTotalCash in hr.payroll.sbs-calculations.shared.ts"],
  },
  {
    code: "HRM-SBS-011",
    status: "shipped",
    evidence: ["compareTotalComp in hr.payroll.sbs-calculations.shared.ts"],
  },
  {
    code: "HRM-SBS-012",
    status: "shipped",
    evidence: ["compaRatio in hr.payroll.sbs-calculations.shared.ts"],
  },
  {
    code: "HRM-SBS-013",
    status: "shipped",
    evidence: ["marketRatio in hr.payroll.sbs-calculations.shared.ts"],
  },
  {
    code: "HRM-SBS-014",
    status: "shipped",
    evidence: ["classifyMarketPosition in hr.payroll.sbs-calculations.shared.ts"],
  },
  {
    code: "HRM-SBS-015",
    status: "shipped",
    evidence: ["flagBelowTarget in hr.payroll.sbs-calculations.shared.ts"],
  },
  {
    code: "HRM-SBS-016",
    status: "shipped",
    evidence: ["flagAboveRange in hr.payroll.sbs-calculations.shared.ts"],
  },
  {
    code: "HRM-SBS-017",
    status: "shipped",
    evidence: ["identifyPayGaps in hr.payroll.sbs-calculations.shared.ts"],
  },
  {
    code: "HRM-SBS-018",
    status: "shipped",
    evidence: ["payEquityAnalysis in hr.payroll.sbs-calculations.shared.ts"],
  },
  {
    code: "HRM-SBS-019",
    status: "shipped",
    evidence: [
      "packages/features/hr-suite/.../data/hr.payroll.sbs-recommendations.server.ts (deriveHrSbsBandReviewIndicator)",
    ],
  },
  {
    code: "HRM-SBS-020",
    status: "shipped",
    evidence: [
      "deriveHrSbsMarketMovementIndicator in hr.payroll.sbs-recommendations.server.ts",
    ],
  },
  {
    code: "HRM-SBS-021",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr-salary-benchmarking.ts (hr_sbs_cpm_recommendation_refs)",
      "packages/db/src/hr-salary-benchmarking-mapping.ts (createHrSbsCpmRecommendationRefsInTx)",
      "packages/features/hr-suite/.../data/hr.payroll.sbs-analysis.server.ts",
    ],
  },
  {
    code: "HRM-SBS-022",
    status: "shipped",
    evidence: [
      "hr_sbs_benchmark_versions (provider, survey_year, effective_date, version_status)",
      "packages/db/src/hr-salary-benchmarking-survey.ts",
    ],
  },
  {
    code: "HRM-SBS-023",
    status: "shipped",
    evidence: [
      "hr_sbs_compensation_analyses.benchmark_version_id + snapshot JSON",
      "packages/db/src/hr-salary-benchmarking.ts (createHrSbsCompensationAnalysisInTx)",
    ],
  },
  {
    code: "HRM-SBS-024",
    status: "shipped",
    evidence: [
      "hr_sbs_currency_refs",
      "packages/db/src/hr-salary-benchmarking-survey.ts (getHrSalaryBenchmarkCurrencyRef)",
    ],
  },
  {
    code: "HRM-SBS-025",
    status: "shipped",
    evidence: [
      "packages/features/hr-suite/.../policies/hr.payroll.sbs-access.policy.server.ts",
      "packages/features/hr-suite/.../contracts/hr.payroll.sbs.contract.ts",
      "surface builders requireErpPermission: hrPayrollSbsReadPermission",
    ],
  },
  {
    code: "HRM-SBS-026",
    status: "shipped",
    evidence: [
      "packages/features/hr-suite/.../data/hr.payroll.sbs-reports.shared.ts",
      "packages/features/hr-suite/.../surface/hr.payroll.sbs-lists.surface.ts (buildHrSbsBenchmarkReportListSurface)",
      "packages/features/hr-suite/.../components/hr.payroll.sbs-section.component.server.tsx",
    ],
  },
  {
    code: "HRM-SBS-027",
    status: "shipped",
    evidence: [
      "buildHrSbsPayEquityReportListSurface",
      "payEquityAnalysis + filterHrSbsPayEquityReportRows",
    ],
  },
  {
    code: "HRM-SBS-028",
    status: "shipped",
    evidence: [
      "hr_sbs_audit_events",
      "packages/db/src/hr-salary-benchmarking-survey.ts (appendHrSbsAuditEventInTx)",
      "packages/features/hr-suite/.../events/hr.payroll.sbs-audit.event.ts",
      "packages/features/hr-suite/.../data/hr.payroll.sbs-audit.server.ts",
    ],
  },
];

export const SBS_ACCEPTANCE_CRITERIA_COVERAGE = [
  { criterion: 1, requirements: ["HRM-SBS-001", "HRM-SBS-002"], status: "shipped" as const },
  { criterion: 2, requirements: ["HRM-SBS-003", "HRM-SBS-004"], status: "shipped" as const },
  { criterion: 3, requirements: ["HRM-SBS-005"], status: "shipped" as const },
  { criterion: 4, requirements: ["HRM-SBS-006"], status: "shipped" as const },
  { criterion: 5, requirements: ["HRM-SBS-008"], status: "shipped" as const },
  { criterion: 6, requirements: ["HRM-SBS-009"], status: "shipped" as const },
  { criterion: 7, requirements: ["HRM-SBS-010"], status: "shipped" as const },
  { criterion: 8, requirements: ["HRM-SBS-011"], status: "shipped" as const },
  { criterion: 9, requirements: ["HRM-SBS-012"], status: "shipped" as const },
  { criterion: 10, requirements: ["HRM-SBS-013"], status: "shipped" as const },
  { criterion: 11, requirements: ["HRM-SBS-014"], status: "shipped" as const },
  { criterion: 12, requirements: ["HRM-SBS-015"], status: "shipped" as const },
  { criterion: 13, requirements: ["HRM-SBS-016"], status: "shipped" as const },
  { criterion: 14, requirements: ["HRM-SBS-017", "HRM-SBS-018"], status: "shipped" as const },
  { criterion: 15, requirements: ["HRM-SBS-019"], status: "shipped" as const },
  { criterion: 16, requirements: ["HRM-SBS-020"], status: "shipped" as const },
  { criterion: 17, requirements: ["HRM-SBS-021"], status: "shipped" as const },
  { criterion: 18, requirements: ["HRM-SBS-023"], status: "shipped" as const },
  { criterion: 19, requirements: ["HRM-SBS-024"], status: "shipped" as const },
  { criterion: 20, requirements: ["HRM-SBS-026"], status: "shipped" as const },
  { criterion: 21, requirements: ["HRM-SBS-027"], status: "shipped" as const },
  { criterion: 22, requirements: ["HRM-SBS-025"], status: "shipped" as const },
  { criterion: 23, requirements: ["HRM-SBS-028"], status: "shipped" as const },
] as const;
