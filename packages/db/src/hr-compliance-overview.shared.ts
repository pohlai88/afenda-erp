/** HRM-CMP-022 — compliance overview dimension keys. */
export const HR_COMPLIANCE_OVERVIEW_DIMENSIONS = [
  "department",
  "legal_entity",
  "work_location",
  "worker_category",
] as const;

export type HrComplianceOverviewDimension =
  (typeof HR_COMPLIANCE_OVERVIEW_DIMENSIONS)[number];

/** HRM-CMP-023 — exportable compliance report kinds. */
export const HR_COMPLIANCE_REPORT_KINDS = [
  "filings",
  "expiry",
  "exceptions",
  "training",
  "acknowledgments",
  "work_eligibility",
] as const;

export type HrComplianceReportKind =
  (typeof HR_COMPLIANCE_REPORT_KINDS)[number];

export const HR_COMPLIANCE_REPORT_EXPORT_ROW_CAP = 5000 as const;
