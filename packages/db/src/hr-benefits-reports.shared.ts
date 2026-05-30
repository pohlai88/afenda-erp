/** HRM-BEN-024 … BEN-026 — exportable benefits report kinds. */
export const HR_BENEFIT_REPORT_KINDS = [
  "cost",
  "enrollment",
  "payroll_deduction",
] as const;

export type HrBenefitReportKind = (typeof HR_BENEFIT_REPORT_KINDS)[number];

export const HR_BENEFIT_REPORT_EXPORT_ROW_CAP = 5000;

export type HrBenefitReportCsvResult = {
  content: string;
  mimeType: string;
  fileExtension: string;
  encoding: "utf8";
  rowCount: number;
  reportKind: HrBenefitReportKind;
};
