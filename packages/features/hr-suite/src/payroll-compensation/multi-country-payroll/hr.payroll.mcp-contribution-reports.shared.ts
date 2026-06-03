import { formatNumeric } from "@afenda/db";

import {
  buildCsv,
  generateMcpStatutoryReport,
  summarizeReportLines,
} from "./hr.payroll.mcp-statutory-reports.shared";
import { generateMcpTaxReport } from "./hr.payroll.mcp-tax-reports.shared";
import {
  hrMcpReportRequestSchema,
  type HrMcpReportKind,
  type HrMcpReportRequest,
  type HrMcpReportResult,
} from "./hr.payroll.mcp-report.schema";

type HrMcpReportRow = Record<string, string | number | null>;

function mapContributionRows(
  request: HrMcpReportRequest,
): readonly HrMcpReportRow[] {
  return request.lineItems.map((line) => ({
    period_ref: request.periodRef,
    country_code: request.countryCode,
    employee_id: line.employeeId,
    employee_name: line.employeeName,
    statutory_reference: line.statutoryReference,
    gross_pay: formatNumeric(line.grossPay, 2),
    employee_contribution: formatNumeric(line.employeeContribution, 2),
    employer_contribution: formatNumeric(line.employerContribution, 2),
    currency_code: line.currencyCode,
  }));
}

const CONTRIBUTION_REPORT_HEADERS = [
  "period_ref",
  "country_code",
  "employee_id",
  "employee_name",
  "statutory_reference",
  "gross_pay",
  "employee_contribution",
  "employer_contribution",
  "currency_code",
] as const;

/** MCP-019 — generate country-specific contribution payroll report. */
export function generateMcpContributionReport(
  rawRequest: HrMcpReportRequest,
): HrMcpReportResult {
  const request = hrMcpReportRequestSchema.parse({
    ...rawRequest,
    reportKind: "contribution" satisfies HrMcpReportKind,
  });

  const rows = mapContributionRows(request);
  return {
    reportKind: "contribution",
    reportCode: request.reportCode,
    countryCode: request.countryCode,
    periodRef: request.periodRef,
    generationStatus: "completed",
    summary: summarizeReportLines(request.lineItems),
    rows: [...rows],
    csvContent: buildCsv(CONTRIBUTION_REPORT_HEADERS, rows),
  };
}

/** MCP-017/018/019 — dispatch report generation by kind. */
export function generateMcpReportByKind(
  request: HrMcpReportRequest,
): HrMcpReportResult {
  switch (request.reportKind) {
    case "statutory":
      return generateMcpStatutoryReport(request);
    case "tax":
      return generateMcpTaxReport(request);
    case "contribution":
      return generateMcpContributionReport(request);
    default: {
      const exhaustive: never = request.reportKind;
      throw new Error(`Unsupported report kind: ${String(exhaustive)}`);
    }
  }
}

export { mapContributionRows, CONTRIBUTION_REPORT_HEADERS };
