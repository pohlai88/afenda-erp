import { z } from "zod";

export const hrMcpCreateCountryConfigSchema = z.object({
  countryCode: z.string().trim().min(2).max(3),
  name: z.string().trim().min(1).max(120),
  defaultCurrencyCode: z.string().trim().min(3).max(3).default("USD"),
  defaultLocale: z.string().trim().min(2).max(16).optional().nullable(),
});

export const hrMcpCreateRuleVersionSchema = z.object({
  countryConfigId: z.string().trim().min(1),
  effectiveFrom: z.coerce.date(),
  effectiveTo: z.coerce.date().optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
});

export const hrMcpPublishRuleVersionSchema = z.object({
  ruleVersionId: z.string().trim().min(1),
});

export const hrMcpPersistFinalizedSnapshotSchema = z.object({
  countryConfigId: z.string().trim().min(1),
  ruleVersionId: z.string().trim().min(1),
  payrollRunRef: z.string().trim().min(1),
  periodRef: z.string().trim().max(64).optional().nullable(),
  legalEntitySetupId: z.string().trim().min(1).optional().nullable(),
  snapshot: z.object({
    ruleVersionId: z.string().trim().min(1),
    versionNumber: z.number().int().positive(),
    countryConfigId: z.string().trim().min(1),
    taxRules: z.array(z.record(z.string(), z.unknown())).optional(),
    statutoryRules: z.array(z.record(z.string(), z.unknown())).optional(),
    employerRules: z.array(z.record(z.string(), z.unknown())).optional(),
    payComponentTreatments: z.array(z.record(z.string(), z.unknown())).optional(),
    prorationRules: z.array(z.record(z.string(), z.unknown())).optional(),
    overtimeRules: z.array(z.record(z.string(), z.unknown())).optional(),
    leaveTreatments: z.array(z.record(z.string(), z.unknown())).optional(),
  }),
});

export const hrMcpCrossCountryReportFilterSchema = z.object({
  periodRef: z.string().trim().min(1),
  countryConfigId: z.string().trim().min(1).optional(),
  legalEntitySetupId: z.string().trim().min(1).optional(),
  currencyCode: z.string().trim().min(3).max(3).optional(),
});

export const hrMcpAuditTrailFilterSchema = z.object({
  search: z.string().trim().max(120).optional(),
  countryConfigId: z.string().trim().min(1).optional(),
  legalEntitySetupId: z.string().trim().min(1).optional(),
  ruleVersionId: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().positive().max(200).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});
