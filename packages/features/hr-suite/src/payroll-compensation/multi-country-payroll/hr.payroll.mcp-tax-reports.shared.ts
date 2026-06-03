import { formatNumeric } from "@afenda/db";

import {
  buildCsv,
  summarizeReportLines,
} from "./hr.payroll.mcp-statutory-reports.shared";
import {
  hrMcpReportRequestSchema,
  type HrMcpReportKind,
  type HrMcpReportRequest,
  type HrMcpReportResult,
} from "./hr.payroll.mcp-report.schema";

type HrMcpReportRow = Record<string, string | number | null>;

function mapTaxRows(request: HrMcpReportRequest): readonly HrMcpReportRow[] {
  return request.lineItems.map((line) => ({
    period_ref: request.periodRef,
    country_code: request.countryCode,
    employee_id: line.employeeId,
    employee_name: line.employeeName,
    tax_id: line.taxId,
    taxable_pay: formatNumeric(line.taxablePay, 2),
    tax_withheld: formatNumeric(line.taxWithheld, 2),
    net_pay: formatNumeric(line.netPay, 2),
    currency_code: line.currencyCode,
  }));
}

const TAX_REPORT_HEADERS = [
  "period_ref",
  "country_code",
  "employee_id",
  "employee_name",
  "tax_id",
  "taxable_pay",
  "tax_withheld",
  "net_pay",
  "currency_code",
] as const;

/** MCP-018 — generate country-specific tax payroll report. */
export function generateMcpTaxReport(
  rawRequest: HrMcpReportRequest,
): HrMcpReportResult {
  const request = hrMcpReportRequestSchema.parse({
    ...rawRequest,
    reportKind: "tax" satisfies HrMcpReportKind,
  });

  const rows = mapTaxRows(request);
  return {
    reportKind: "tax",
    reportCode: request.reportCode,
    countryCode: request.countryCode,
    periodRef: request.periodRef,
    generationStatus: "completed",
    summary: summarizeReportLines(request.lineItems),
    rows: [...rows],
    csvContent: buildCsv(TAX_REPORT_HEADERS, rows),
  };
}

export { mapTaxRows, TAX_REPORT_HEADERS };
