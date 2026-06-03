import { z } from "zod";

/** MCP-017/018/019 — aligned with `hr_mcp_report_kind` enum. */
export const HR_MCP_REPORT_KINDS = [
  "statutory",
  "tax",
  "contribution",
] as const;

export type HrMcpReportKind = (typeof HR_MCP_REPORT_KINDS)[number];

export const HR_MCP_REPORT_GENERATION_STATUSES = [
  "pending",
  "completed",
  "failed",
] as const;

export type HrMcpReportGenerationStatus =
  (typeof HR_MCP_REPORT_GENERATION_STATUSES)[number];

const hrMcpEntityIdSchema = z.string().trim().min(1).max(64);
const hrMcpCountryCodeSchema = z
  .string()
  .trim()
  .length(2)
  .transform((value) => value.toUpperCase());
const hrMcpMoneyAmountSchema = z.number().finite();

export const hrMcpReportLineItemSchema = z.object({
  employeeId: hrMcpEntityIdSchema,
  employeeName: z.string().trim().min(1).max(200),
  taxId: z.string().trim().max(64).nullable(),
  statutoryReference: z.string().trim().max(64).nullable(),
  currencyCode: z.string().trim().length(3),
  grossPay: hrMcpMoneyAmountSchema,
  taxablePay: hrMcpMoneyAmountSchema,
  taxWithheld: hrMcpMoneyAmountSchema,
  employeeContribution: hrMcpMoneyAmountSchema,
  employerContribution: hrMcpMoneyAmountSchema,
  netPay: hrMcpMoneyAmountSchema,
});

export type HrMcpReportLineItem = z.infer<typeof hrMcpReportLineItemSchema>;

export const hrMcpReportRequestSchema = z.object({
  organizationId: hrMcpEntityIdSchema,
  countryCode: hrMcpCountryCodeSchema,
  reportKind: z.enum(HR_MCP_REPORT_KINDS),
  reportCode: z.string().trim().min(1).max(64),
  periodRef: z.string().trim().min(1).max(64),
  legalEntitySetupId: hrMcpEntityIdSchema.nullable(),
  lineItems: z.array(hrMcpReportLineItemSchema).min(1),
});

export type HrMcpReportRequest = z.infer<typeof hrMcpReportRequestSchema>;

export const hrMcpReportSummarySchema = z.object({
  employeeCount: z.number().int().nonnegative(),
  totalGrossPay: hrMcpMoneyAmountSchema,
  totalTaxWithheld: hrMcpMoneyAmountSchema,
  totalEmployeeContribution: hrMcpMoneyAmountSchema,
  totalEmployerContribution: hrMcpMoneyAmountSchema,
  totalNetPay: hrMcpMoneyAmountSchema,
});

export type HrMcpReportSummary = z.infer<typeof hrMcpReportSummarySchema>;

export const hrMcpReportResultSchema = z.object({
  reportKind: z.enum(HR_MCP_REPORT_KINDS),
  reportCode: z.string(),
  countryCode: hrMcpCountryCodeSchema,
  periodRef: z.string(),
  generationStatus: z.enum(HR_MCP_REPORT_GENERATION_STATUSES),
  summary: hrMcpReportSummarySchema,
  rows: z.array(z.record(z.string(), z.union([z.string(), z.number(), z.null()]))),
  csvContent: z.string(),
});

export type HrMcpReportResult = z.infer<typeof hrMcpReportResultSchema>;
