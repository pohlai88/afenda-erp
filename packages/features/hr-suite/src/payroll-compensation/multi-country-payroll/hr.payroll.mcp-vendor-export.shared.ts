import { formatNumeric } from "@afenda/db";

import { escapeCsvCell } from "./hr.payroll.mcp-statutory-reports.shared";
import { HrMcpValidationError } from "./hr.payroll.mcp-statutory-readiness.shared";
import {
  HR_MCP_VENDOR_EXPORT_TARGETS,
  hrMcpVendorExportRequestSchema,
  type HrMcpVendorExportRequest,
  type HrMcpVendorExportResult,
  type HrMcpVendorExportTarget,
} from "./hr.payroll.mcp-export.schema";

export { HR_MCP_VENDOR_EXPORT_TARGETS };

type HrMcpVendorExportBuilder = (
  request: HrMcpVendorExportRequest,
) => HrMcpVendorExportResult;

function buildCsvFromMatrix(
  headers: readonly string[],
  matrix: readonly (readonly (string | number | null)[])[],
): string {
  const headerLine = headers.map(escapeCsvCell).join(",");
  const dataLines = matrix.map((row) => row.map(escapeCsvCell).join(","));
  return [headerLine, ...dataLines].join("\n");
}

/** MCP-022 — statutory portal filing export builder. */
function buildStatutoryPortalExport(
  request: HrMcpVendorExportRequest,
): HrMcpVendorExportResult {
  const headers = [
    "period_ref",
    "country_code",
    "vendor_code",
    "employee_id",
    "employee_name",
    "tax_id",
    "statutory_reference",
    "gross_pay",
    "net_pay",
    "currency_code",
  ] as const;

  const matrix = request.lines.map((line) => [
    request.periodRef,
    request.countryCode,
    request.vendorCode,
    line.employeeId,
    line.employeeName,
    line.taxId,
    line.statutoryReference,
    formatNumeric(line.grossPay, 2),
    formatNumeric(line.netPay, 2),
    line.currencyCode,
  ]);

  return {
    target: "statutory_portal",
    vendorCode: request.vendorCode,
    countryCode: request.countryCode,
    periodRef: request.periodRef,
    fileName: `statutory-portal-${request.countryCode}-${request.periodRef}.csv`,
    mimeType: "text/csv",
    content: buildCsvFromMatrix(headers, matrix),
    lineCount: request.lines.length,
  };
}

/** MCP-022 — local payroll vendor handoff export builder. */
function buildPayrollVendorExport(
  request: HrMcpVendorExportRequest,
): HrMcpVendorExportResult {
  const headers = [
    "vendor_code",
    "period_ref",
    "country_code",
    "employee_id",
    "employee_name",
    "tax_id",
    "gross_pay",
    "net_pay",
    "currency_code",
  ] as const;

  const matrix = request.lines.map((line) => [
    request.vendorCode,
    request.periodRef,
    request.countryCode,
    line.employeeId,
    line.employeeName,
    line.taxId,
    formatNumeric(line.grossPay, 2),
    formatNumeric(line.netPay, 2),
    line.currencyCode,
  ]);

  return {
    target: "payroll_vendor",
    vendorCode: request.vendorCode,
    countryCode: request.countryCode,
    periodRef: request.periodRef,
    fileName: `vendor-${request.vendorCode}-${request.periodRef}.csv`,
    mimeType: "text/csv",
    content: buildCsvFromMatrix(headers, matrix),
    lineCount: request.lines.length,
  };
}

const HR_MCP_VENDOR_EXPORT_BUILDERS: Readonly<
  Record<HrMcpVendorExportTarget, HrMcpVendorExportBuilder>
> = {
  statutory_portal: buildStatutoryPortalExport,
  payroll_vendor: buildPayrollVendorExport,
};

/** MCP-022 — build statutory portal or payroll vendor export file. */
export function buildVendorExport(
  rawRequest: HrMcpVendorExportRequest,
): HrMcpVendorExportResult {
  const parsed = hrMcpVendorExportRequestSchema.safeParse(rawRequest);
  if (!parsed.success) {
    throw new HrMcpValidationError(
      "invalid_threshold_input",
      parsed.error.issues.map((issue) => issue.message).join("; "),
    );
  }

  const request = parsed.data;
  const builder = HR_MCP_VENDOR_EXPORT_BUILDERS[request.target];
  return builder(request);
}

export function listVendorExportTargets(): readonly HrMcpVendorExportTarget[] {
  return HR_MCP_VENDOR_EXPORT_TARGETS;
}

export {
  buildStatutoryPortalExport,
  buildPayrollVendorExport,
  HR_MCP_VENDOR_EXPORT_BUILDERS,
};
