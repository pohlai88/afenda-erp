import { formatNumeric } from "@afenda/db";

import { escapeCsvCell } from "./hr.payroll.mcp-statutory-reports.shared";
import { HrMcpValidationError } from "./hr.payroll.mcp-statutory-readiness.shared";
import {
  HR_MCP_BANK_EXPORT_FORMATS,
  hrMcpBankExportRequestSchema,
  type HrMcpBankExportFormat,
  type HrMcpBankExportRequest,
  type HrMcpBankExportResult,
  type HrMcpBankPaymentLine,
} from "../schemas/hr.payroll.mcp-export.schema";

export { HR_MCP_BANK_EXPORT_FORMATS };

type HrMcpBankExportBuilder = (
  request: HrMcpBankExportRequest,
) => HrMcpBankExportResult;

function buildCsvFromMatrix(
  headers: readonly string[],
  matrix: readonly (readonly (string | number | null)[])[],
): string {
  const headerLine = headers.map(escapeCsvCell).join(",");
  const dataLines = matrix.map((row) => row.map(escapeCsvCell).join(","));
  return [headerLine, ...dataLines].join("\n");
}

/** MCP-021 — Malaysia bank payment CSV stub. */
function buildMyBankPaymentCsv(
  request: HrMcpBankExportRequest,
): HrMcpBankExportResult {
  const headers = [
    "employee_id",
    "employee_name",
    "bank_code",
    "account_number",
    "amount",
    "currency_code",
    "payment_reference",
  ] as const;

  const matrix = request.lines.map((line) => [
    line.employeeId,
    line.employeeName,
    line.bankCode,
    line.accountNumber,
    formatNumeric(line.amount, 2),
    line.currencyCode,
    line.paymentReference,
  ]);

  return {
    format: "MY_CSV",
    countryCode: request.countryCode,
    periodRef: request.periodRef,
    fileName: `bank-payment-${request.countryCode}-${request.periodRef}.csv`,
    mimeType: "text/csv",
    content: buildCsvFromMatrix(headers, matrix),
    lineCount: request.lines.length,
  };
}

/** MCP-021 — Singapore bank payment CSV stub. */
function buildSgBankPaymentCsv(
  request: HrMcpBankExportRequest,
): HrMcpBankExportResult {
  const headers = [
    "employee_id",
    "beneficiary_name",
    "bank_code",
    "account_number",
    "amount",
    "currency_code",
    "reference",
  ] as const;

  const matrix = request.lines.map((line) => [
    line.employeeId,
    line.employeeName,
    line.bankCode,
    line.accountNumber,
    formatNumeric(line.amount, 2),
    line.currencyCode,
    line.paymentReference,
  ]);

  return {
    format: "SG_CSV",
    countryCode: request.countryCode,
    periodRef: request.periodRef,
    fileName: `giro-${request.countryCode}-${request.periodRef}.csv`,
    mimeType: "text/csv",
    content: buildCsvFromMatrix(headers, matrix),
    lineCount: request.lines.length,
  };
}

/** MCP-021 — UK BACS-style bank payment CSV stub. */
function buildUkBankPaymentCsv(
  request: HrMcpBankExportRequest,
): HrMcpBankExportResult {
  const headers = [
    "employee_id",
    "beneficiary_name",
    "sort_code",
    "account_number",
    "amount",
    "currency_code",
    "payment_reference",
  ] as const;

  const matrix = request.lines.map((line) => [
    line.employeeId,
    line.employeeName,
    line.sortCode,
    line.accountNumber,
    formatNumeric(line.amount, 2),
    line.currencyCode,
    line.paymentReference,
  ]);

  return {
    format: "UK_CSV",
    countryCode: request.countryCode,
    periodRef: request.periodRef,
    fileName: `bacs-${request.periodRef}.csv`,
    mimeType: "text/csv",
    content: buildCsvFromMatrix(headers, matrix),
    lineCount: request.lines.length,
  };
}

const HR_MCP_BANK_EXPORT_BUILDERS: Readonly<
  Record<HrMcpBankExportFormat, HrMcpBankExportBuilder>
> = {
  MY_CSV: buildMyBankPaymentCsv,
  SG_CSV: buildSgBankPaymentCsv,
  UK_CSV: buildUkBankPaymentCsv,
};

export function listRegisteredBankExportFormats(): readonly HrMcpBankExportFormat[] {
  return HR_MCP_BANK_EXPORT_FORMATS;
}

export function resolveBankExportFormatForCountry(
  countryCode: string,
): HrMcpBankExportFormat | null {
  switch (countryCode.toUpperCase()) {
    case "MY":
      return "MY_CSV";
    case "SG":
      return "SG_CSV";
    case "GB":
    case "UK":
      return "UK_CSV";
    default:
      return null;
  }
}

function assertBankLineValidForFormat(
  format: HrMcpBankExportFormat,
  line: HrMcpBankPaymentLine,
): void {
  if (format === "UK_CSV" && (line.sortCode === null || line.sortCode.trim() === "")) {
    throw new HrMcpValidationError(
      "invalid_threshold_input",
      `UK bank export requires sort_code for employee ${line.employeeId}.`,
    );
  }
}

/** MCP-021 — build country-specific bank payment export file. */
export function buildBankPaymentExport(
  rawRequest: HrMcpBankExportRequest,
): HrMcpBankExportResult {
  const parsed = hrMcpBankExportRequestSchema.safeParse(rawRequest);
  if (!parsed.success) {
    throw new HrMcpValidationError(
      "invalid_threshold_input",
      parsed.error.issues.map((issue) => issue.message).join("; "),
    );
  }

  const request = parsed.data;
  const builder = HR_MCP_BANK_EXPORT_BUILDERS[request.format];
  if (builder === undefined) {
    throw new HrMcpValidationError(
      "invalid_threshold_input",
      `Unsupported bank export format: ${request.format}`,
    );
  }

  for (const line of request.lines) {
    assertBankLineValidForFormat(request.format, line);
  }

  return builder(request);
}

export function registerBankExportBuilder(
  format: HrMcpBankExportFormat,
  builder: HrMcpBankExportBuilder,
): void {
  (HR_MCP_BANK_EXPORT_BUILDERS as Record<string, HrMcpBankExportBuilder>)[format] =
    builder;
}

export {
  buildMyBankPaymentCsv,
  buildSgBankPaymentCsv,
  buildUkBankPaymentCsv,
  HR_MCP_BANK_EXPORT_BUILDERS,
};
