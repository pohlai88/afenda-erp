import { formatNumeric } from "@afenda/db";

import {
  hrMcpReportRequestSchema,
  type HrMcpReportKind,
  type HrMcpReportLineItem,
  type HrMcpReportRequest,
  type HrMcpReportResult,
  type HrMcpReportSummary,
} from "../schemas/hr.payroll.mcp-report.schema";

type HrMcpReportRow = Record<string, string | number | null>;

function escapeCsvCell(value: string | number | null): string {
  if (value === null) {
    return "";
  }
  const text = String(value);
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function buildCsv(headers: readonly string[], rows: readonly HrMcpReportRow[]): string {
  const headerLine = headers.map(escapeCsvCell).join(",");
  const dataLines = rows.map((row) =>
    headers.map((header) => escapeCsvCell(row[header] ?? null)).join(","),
  );
  return [headerLine, ...dataLines].join("\n");
}

function summarizeReportLines(
  lineItems: readonly HrMcpReportLineItem[],
): HrMcpReportSummary {
  return lineItems.reduce<HrMcpReportSummary>(
    (acc, line) => ({
      employeeCount: acc.employeeCount + 1,
      totalGrossPay: acc.totalGrossPay + line.grossPay,
      totalTaxWithheld: acc.totalTaxWithheld + line.taxWithheld,
      totalEmployeeContribution:
        acc.totalEmployeeContribution + line.employeeContribution,
      totalEmployerContribution:
        acc.totalEmployerContribution + line.employerContribution,
      totalNetPay: acc.totalNetPay + line.netPay,
    }),
    {
      employeeCount: 0,
      totalGrossPay: 0,
      totalTaxWithheld: 0,
      totalEmployeeContribution: 0,
      totalEmployerContribution: 0,
      totalNetPay: 0,
    },
  );
}

function mapStatutoryRows(
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
    net_pay: formatNumeric(line.netPay, 2),
  }));
}

const STATUTORY_REPORT_HEADERS = [
  "period_ref",
  "country_code",
  "employee_id",
  "employee_name",
  "statutory_reference",
  "gross_pay",
  "employee_contribution",
  "employer_contribution",
  "net_pay",
] as const;

/** MCP-017 — generate country-specific statutory payroll report. */
export function generateMcpStatutoryReport(
  rawRequest: HrMcpReportRequest,
): HrMcpReportResult {
  const request = hrMcpReportRequestSchema.parse({
    ...rawRequest,
    reportKind: "statutory" satisfies HrMcpReportKind,
  });

  const rows = mapStatutoryRows(request);
  return {
    reportKind: "statutory",
    reportCode: request.reportCode,
    countryCode: request.countryCode,
    periodRef: request.periodRef,
    generationStatus: "completed",
    summary: summarizeReportLines(request.lineItems),
    rows: [...rows],
    csvContent: buildCsv(STATUTORY_REPORT_HEADERS, rows),
  };
}

export {
  buildCsv,
  escapeCsvCell,
  summarizeReportLines,
  mapStatutoryRows,
  STATUTORY_REPORT_HEADERS,
};
