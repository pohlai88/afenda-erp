import { z } from "zod";

import {
  hrMcpCurrencyCodeSchema,
  hrMcpEntityIdSchema,
  hrMcpFormDateInput,
  hrMcpMoneyAmountSchema,
} from "./hr.payroll.mcp-form-fields.shared";

/** MCP-008 — payroll currency by country and optional legal entity. */
export const hrMcpUpsertCurrencyConfigSchema = z.object({
  countryConfigId: hrMcpEntityIdSchema,
  legalEntitySetupId: hrMcpEntityIdSchema.nullable().optional(),
  payrollCurrencyCode: hrMcpCurrencyCodeSchema,
  reportingCurrencyCode: hrMcpCurrencyCodeSchema.nullable().optional(),
  active: z.coerce.boolean().default(true),
});

export type HrMcpUpsertCurrencyConfigInput = z.infer<
  typeof hrMcpUpsertCurrencyConfigSchema
>;

export const hrMcpCurrencyConfigRecordSchema =
  hrMcpUpsertCurrencyConfigSchema.extend({
    id: hrMcpEntityIdSchema,
    organizationId: hrMcpEntityIdSchema,
  });

export type HrMcpCurrencyConfigRecord = z.infer<
  typeof hrMcpCurrencyConfigRecordSchema
>;

/** MCP-009 — exchange rate references for reporting and consolidation. */
export const hrMcpUpsertExchangeRateSchema = z.object({
  fromCurrencyCode: hrMcpCurrencyCodeSchema,
  toCurrencyCode: hrMcpCurrencyCodeSchema,
  rate: hrMcpMoneyAmountSchema.positive(),
  rateDate: hrMcpFormDateInput,
  sourceReference: z.string().trim().max(128).nullable().optional(),
});

export type HrMcpUpsertExchangeRateInput = z.infer<
  typeof hrMcpUpsertExchangeRateSchema
>;

export const hrMcpExchangeRateRecordSchema = hrMcpUpsertExchangeRateSchema.extend({
  id: hrMcpEntityIdSchema,
  organizationId: hrMcpEntityIdSchema,
});

export type HrMcpExchangeRateRecord = z.infer<
  typeof hrMcpExchangeRateRecordSchema
>;

export const hrMcpExchangeRateLookupInputSchema = z.object({
  organizationId: hrMcpEntityIdSchema.optional(),
  fromCurrencyCode: hrMcpCurrencyCodeSchema,
  toCurrencyCode: hrMcpCurrencyCodeSchema,
  rateDate: hrMcpFormDateInput,
});

export type HrMcpExchangeRateLookupInput = z.infer<
  typeof hrMcpExchangeRateLookupInputSchema
>;

export const hrMcpExchangeRateReferenceSchema = z.object({
  fromCurrencyCode: hrMcpCurrencyCodeSchema,
  toCurrencyCode: hrMcpCurrencyCodeSchema,
  rate: hrMcpMoneyAmountSchema.positive(),
  rateDate: hrMcpFormDateInput,
  sourceReference: z.string().nullable(),
});

export type HrMcpExchangeRateReference = z.infer<
  typeof hrMcpExchangeRateReferenceSchema
>;

export const hrMcpUpsertCurrencyConfigFormSchema = hrMcpUpsertCurrencyConfigSchema;
export const hrMcpUpsertExchangeRateFormSchema = hrMcpUpsertExchangeRateSchema;
