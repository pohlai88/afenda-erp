import { z } from "zod";

import {
  HR_MCP_PAY_COMPONENT_CONTRIBUTION_TREATMENTS,
  HR_MCP_PAY_COMPONENT_PENSION_TREATMENTS,
  HR_MCP_PAY_COMPONENT_TAX_TREATMENTS,
} from "./hr.payroll.mcp-constants.shared";
import {
  hrMcpEntityIdSchema,
  hrMcpFormDateTimeInput,
  hrMcpRuleConfigSchema,
} from "./hr.payroll.mcp-form-fields.shared";

/** MCP-006/007 — pay component treatments by country. */
export const hrMcpUpsertPayComponentTreatmentSchema = z.object({
  countryConfigId: hrMcpEntityIdSchema,
  ruleVersionId: hrMcpEntityIdSchema.nullable().optional(),
  payComponentCode: z.string().trim().min(1).max(64),
  payComponentName: z.string().trim().max(256).nullable().optional(),
  taxTreatment: z.enum(HR_MCP_PAY_COMPONENT_TAX_TREATMENTS),
  contributionTreatment: z.enum(HR_MCP_PAY_COMPONENT_CONTRIBUTION_TREATMENTS),
  pensionTreatment: z.enum(HR_MCP_PAY_COMPONENT_PENSION_TREATMENTS),
  ruleConfig: hrMcpRuleConfigSchema.nullable().optional(),
  effectiveFrom: hrMcpFormDateTimeInput,
  effectiveTo: hrMcpFormDateTimeInput.nullable().optional(),
  active: z.coerce.boolean().default(true),
});

export type HrMcpUpsertPayComponentTreatmentInput = z.infer<
  typeof hrMcpUpsertPayComponentTreatmentSchema
>;

export const hrMcpPayComponentTreatmentRecordSchema =
  hrMcpUpsertPayComponentTreatmentSchema.extend({
    id: hrMcpEntityIdSchema,
    organizationId: hrMcpEntityIdSchema,
  });

export type HrMcpPayComponentTreatmentRecord = z.infer<
  typeof hrMcpPayComponentTreatmentRecordSchema
>;

/** MCP-007 — resolved classification for a pay component amount. */
export const hrMcpPayComponentTreatmentSnapshotSchema = z.object({
  payComponentCode: z.string().trim().min(1).max(64),
  taxTreatment: z.enum(HR_MCP_PAY_COMPONENT_TAX_TREATMENTS),
  contributionTreatment: z.enum(HR_MCP_PAY_COMPONENT_CONTRIBUTION_TREATMENTS),
  pensionTreatment: z.enum(HR_MCP_PAY_COMPONENT_PENSION_TREATMENTS),
});

export type HrMcpPayComponentTreatmentSnapshot = z.infer<
  typeof hrMcpPayComponentTreatmentSnapshotSchema
>;

export const hrMcpResolvePayComponentTreatmentInputSchema = z.object({
  payComponentCode: z.string().trim().min(1).max(64),
  amount: z.number().finite(),
  effectiveAt: hrMcpFormDateTimeInput,
  treatments: z.array(hrMcpPayComponentTreatmentSnapshotSchema).min(1),
});

export type HrMcpResolvePayComponentTreatmentInput = z.infer<
  typeof hrMcpResolvePayComponentTreatmentInputSchema
>;

export const hrMcpResolvedPayComponentAmountsSchema = z.object({
  payComponentCode: z.string().trim().min(1).max(64),
  grossAmount: z.number().finite(),
  taxableAmount: z.number().finite().nonnegative(),
  contributableAmount: z.number().finite().nonnegative(),
  pensionableAmount: z.number().finite().nonnegative(),
  treatment: hrMcpPayComponentTreatmentSnapshotSchema,
});

export type HrMcpResolvedPayComponentAmounts = z.infer<
  typeof hrMcpResolvedPayComponentAmountsSchema
>;

export const hrMcpUpsertPayComponentTreatmentFormSchema =
  hrMcpUpsertPayComponentTreatmentSchema;
