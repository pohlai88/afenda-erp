import { z } from "zod";

import {
  hrMcpCountryCodeSchema,
  hrMcpCurrencyCodeSchema,
  hrMcpEntityIdSchema,
} from "./hr.payroll.mcp-form-fields.shared";

/** MCP-001 — country payroll configuration settings payload. */
export const hrMcpCountryConfigSettingsSchema = z.object({
  locale: z.string().trim().max(16).nullable().optional(),
  dateFormat: z.string().trim().max(32).nullable().optional(),
  addressFormat: z.string().trim().max(64).nullable().optional(),
  taxIdFormat: z.string().trim().max(64).nullable().optional(),
  statutoryIdFormat: z.string().trim().max(64).nullable().optional(),
  minimumWageReference: z.string().trim().max(128).nullable().optional(),
});

export type HrMcpCountryConfigSettings = z.infer<
  typeof hrMcpCountryConfigSettingsSchema
>;

/** MCP-001 — create or update country payroll configuration. */
export const hrMcpUpsertCountryConfigSchema = z.object({
  countryCode: hrMcpCountryCodeSchema,
  name: z.string().trim().min(1).max(256),
  defaultCurrencyCode: hrMcpCurrencyCodeSchema.default("USD"),
  defaultLocale: z.string().trim().max(16).nullable().optional(),
  settings: hrMcpCountryConfigSettingsSchema.nullable().optional(),
  active: z.coerce.boolean().default(true),
});

export type HrMcpUpsertCountryConfigInput = z.infer<
  typeof hrMcpUpsertCountryConfigSchema
>;

export const hrMcpCountryConfigRecordSchema = hrMcpUpsertCountryConfigSchema.extend({
  id: hrMcpEntityIdSchema,
  organizationId: hrMcpEntityIdSchema,
});

export type HrMcpCountryConfigRecord = z.infer<
  typeof hrMcpCountryConfigRecordSchema
>;

export const hrMcpUpsertCountryConfigFormSchema = hrMcpUpsertCountryConfigSchema;
