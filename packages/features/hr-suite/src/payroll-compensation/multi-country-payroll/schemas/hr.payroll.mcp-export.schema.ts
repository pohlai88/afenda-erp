import { z } from "zod";

/** MCP-021/022 — aligned with `hr_mcp_export_format_kind` enum. */
export const HR_MCP_EXPORT_FORMAT_KINDS = [
  "bank_payment",
  "statutory_portal",
  "payroll_vendor",
] as const;

export type HrMcpExportFormatKind = (typeof HR_MCP_EXPORT_FORMAT_KINDS)[number];

export const HR_MCP_BANK_EXPORT_FORMATS = ["MY_CSV", "SG_CSV", "UK_CSV"] as const;

export type HrMcpBankExportFormat = (typeof HR_MCP_BANK_EXPORT_FORMATS)[number];

export const HR_MCP_VENDOR_EXPORT_TARGETS = [
  "statutory_portal",
  "payroll_vendor",
] as const;

export type HrMcpVendorExportTarget =
  (typeof HR_MCP_VENDOR_EXPORT_TARGETS)[number];

const hrMcpEntityIdSchema = z.string().trim().min(1).max(64);
const hrMcpCountryCodeSchema = z
  .string()
  .trim()
  .length(2)
  .transform((value) => value.toUpperCase());
const hrMcpMoneyAmountSchema = z.number().finite().nonnegative();

export const hrMcpPayslipFieldManifestEntrySchema = z.object({
  fieldKey: z.string().trim().min(1).max(64),
  label: z.string().trim().min(1).max(200),
  required: z.boolean(),
  displayOrder: z.number().int().nonnegative(),
  statutoryBreakdown: z.boolean().default(false),
});

export type HrMcpPayslipFieldManifestEntry = z.infer<
  typeof hrMcpPayslipFieldManifestEntrySchema
>;

export const hrMcpPayslipFieldValuesSchema = z.record(
  z.string().trim().min(1).max(64),
  z.union([z.string(), z.number(), z.null()]),
);

export type HrMcpPayslipFieldValues = z.infer<
  typeof hrMcpPayslipFieldValuesSchema
>;

export const hrMcpResolvePayslipFieldsInputSchema = z.object({
  countryCode: hrMcpCountryCodeSchema,
  manifest: z.array(hrMcpPayslipFieldManifestEntrySchema).min(1),
  values: hrMcpPayslipFieldValuesSchema,
});

export type HrMcpResolvePayslipFieldsInput = z.infer<
  typeof hrMcpResolvePayslipFieldsInputSchema
>;

export const hrMcpResolvedPayslipFieldSchema = z.object({
  fieldKey: z.string(),
  label: z.string(),
  value: z.union([z.string(), z.number(), z.null()]),
  required: z.boolean(),
  displayOrder: z.number().int(),
  statutoryBreakdown: z.boolean(),
  missing: z.boolean(),
});

export type HrMcpResolvedPayslipField = z.infer<
  typeof hrMcpResolvedPayslipFieldSchema
>;

export const hrMcpBankPaymentLineSchema = z.object({
  employeeId: hrMcpEntityIdSchema,
  employeeName: z.string().trim().min(1).max(200),
  bankCode: z.string().trim().min(1).max(16),
  accountNumber: z.string().trim().min(1).max(34),
  sortCode: z.string().trim().max(16).nullable(),
  amount: hrMcpMoneyAmountSchema,
  currencyCode: z.string().trim().length(3),
  paymentReference: z.string().trim().min(1).max(64),
});

export type HrMcpBankPaymentLine = z.infer<typeof hrMcpBankPaymentLineSchema>;

export const hrMcpBankExportRequestSchema = z.object({
  countryCode: hrMcpCountryCodeSchema,
  format: z.enum(HR_MCP_BANK_EXPORT_FORMATS),
  periodRef: z.string().trim().min(1).max(64),
  lines: z.array(hrMcpBankPaymentLineSchema).min(1),
});

export type HrMcpBankExportRequest = z.infer<
  typeof hrMcpBankExportRequestSchema
>;

export const hrMcpBankExportResultSchema = z.object({
  format: z.enum(HR_MCP_BANK_EXPORT_FORMATS),
  countryCode: hrMcpCountryCodeSchema,
  periodRef: z.string(),
  fileName: z.string(),
  mimeType: z.literal("text/csv"),
  content: z.string(),
  lineCount: z.number().int().positive(),
});

export type HrMcpBankExportResult = z.infer<typeof hrMcpBankExportResultSchema>;

export const hrMcpVendorExportLineSchema = z.object({
  employeeId: hrMcpEntityIdSchema,
  employeeName: z.string().trim().min(1).max(200),
  taxId: z.string().trim().max(64).nullable(),
  statutoryReference: z.string().trim().max(64).nullable(),
  grossPay: hrMcpMoneyAmountSchema,
  netPay: hrMcpMoneyAmountSchema,
  currencyCode: z.string().trim().length(3),
});

export type HrMcpVendorExportLine = z.infer<typeof hrMcpVendorExportLineSchema>;

export const hrMcpVendorExportRequestSchema = z.object({
  countryCode: hrMcpCountryCodeSchema,
  target: z.enum(HR_MCP_VENDOR_EXPORT_TARGETS),
  vendorCode: z.string().trim().min(1).max(64),
  periodRef: z.string().trim().min(1).max(64),
  lines: z.array(hrMcpVendorExportLineSchema).min(1),
});

export type HrMcpVendorExportRequest = z.infer<
  typeof hrMcpVendorExportRequestSchema
>;

export const hrMcpVendorExportResultSchema = z.object({
  target: z.enum(HR_MCP_VENDOR_EXPORT_TARGETS),
  vendorCode: z.string(),
  countryCode: hrMcpCountryCodeSchema,
  periodRef: z.string(),
  fileName: z.string(),
  mimeType: z.literal("text/csv"),
  content: z.string(),
  lineCount: z.number().int().positive(),
});

export type HrMcpVendorExportResult = z.infer<
  typeof hrMcpVendorExportResultSchema
>;
