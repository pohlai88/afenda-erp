import { z } from "zod";

import {
  hrMcpCountryCodeSchema,
  hrMcpEntityIdSchema,
} from "./hr.payroll.mcp-form-fields.shared";

/** MCP-002 — legal entity payroll setup per country. */
export const hrMcpUpsertLegalEntitySetupSchema = z.object({
  countryConfigId: hrMcpEntityIdSchema,
  legalEntityCode: z.string().trim().min(1).max(64),
  name: z.string().trim().min(1).max(256),
  registrationNumber: z.string().trim().max(128).nullable().optional(),
  statutoryEmployerAccount: z.string().trim().max(128).nullable().optional(),
  payrollCountryCode: hrMcpCountryCodeSchema,
  payGroupCode: z.string().trim().max(64).nullable().optional(),
  active: z.coerce.boolean().default(true),
});

export type HrMcpUpsertLegalEntitySetupInput = z.infer<
  typeof hrMcpUpsertLegalEntitySetupSchema
>;

export const hrMcpLegalEntitySetupRecordSchema =
  hrMcpUpsertLegalEntitySetupSchema.extend({
    id: hrMcpEntityIdSchema,
    organizationId: hrMcpEntityIdSchema,
  });

export type HrMcpLegalEntitySetupRecord = z.infer<
  typeof hrMcpLegalEntitySetupRecordSchema
>;

export const hrMcpUpsertLegalEntitySetupFormSchema =
  hrMcpUpsertLegalEntitySetupSchema;
