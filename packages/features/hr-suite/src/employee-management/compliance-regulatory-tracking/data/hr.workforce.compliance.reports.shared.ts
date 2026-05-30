/** HRM-CMP-023 — exportable compliance report kinds (mirrors @afenda/db). */
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

export type HrComplianceReportCsvResult = {
  content: string;
  mimeType: "text/csv;charset=utf-8";
  fileExtension: "csv";
  encoding: "utf8";
  rowCount: number;
  reportKind: HrComplianceReportKind;
};
