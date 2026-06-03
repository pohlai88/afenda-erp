import { z } from "zod";

import {
  hrMcpEntityIdSchema,
  hrMcpFormDateTimeInput,
  hrMcpRuleConfigSchema,
} from "./hr.payroll.mcp-form-fields.shared";

const hrMcpEffectiveRuleBaseSchema = z.object({
  countryConfigId: hrMcpEntityIdSchema,
  ruleVersionId: hrMcpEntityIdSchema.nullable().optional(),
  code: z.string().trim().min(1).max(64),
  name: z.string().trim().min(1).max(256),
  referenceCode: z.string().trim().max(128).nullable().optional(),
  ruleConfig: hrMcpRuleConfigSchema,
  effectiveFrom: hrMcpFormDateTimeInput,
  effectiveTo: hrMcpFormDateTimeInput.nullable().optional(),
  active: z.coerce.boolean().default(true),
});

/** MCP-003 — country-specific tax rule references. */
export const hrMcpUpsertTaxRuleSchema = hrMcpEffectiveRuleBaseSchema;

export type HrMcpUpsertTaxRuleInput = z.infer<typeof hrMcpUpsertTaxRuleSchema>;

/** MCP-004 — statutory contribution rules. */
export const hrMcpUpsertStatutoryContributionRuleSchema =
  hrMcpEffectiveRuleBaseSchema.extend({
    contributionType: z.string().trim().min(1).max(64),
  });

export type HrMcpUpsertStatutoryContributionRuleInput = z.infer<
  typeof hrMcpUpsertStatutoryContributionRuleSchema
>;

/** MCP-005 — employer contribution rules. */
export const hrMcpUpsertEmployerContributionRuleSchema =
  hrMcpEffectiveRuleBaseSchema.extend({
    contributionType: z.string().trim().min(1).max(64),
  });

export type HrMcpUpsertEmployerContributionRuleInput = z.infer<
  typeof hrMcpUpsertEmployerContributionRuleSchema
>;

export const hrMcpTaxRuleRecordSchema = hrMcpUpsertTaxRuleSchema.extend({
  id: hrMcpEntityIdSchema,
  organizationId: hrMcpEntityIdSchema,
});

export const hrMcpStatutoryContributionRuleRecordSchema =
  hrMcpUpsertStatutoryContributionRuleSchema.extend({
    id: hrMcpEntityIdSchema,
    organizationId: hrMcpEntityIdSchema,
  });

export const hrMcpEmployerContributionRuleRecordSchema =
  hrMcpUpsertEmployerContributionRuleSchema.extend({
    id: hrMcpEntityIdSchema,
    organizationId: hrMcpEntityIdSchema,
  });

export const hrMcpUpsertTaxRuleFormSchema = hrMcpUpsertTaxRuleSchema;
export const hrMcpUpsertStatutoryContributionRuleFormSchema =
  hrMcpUpsertStatutoryContributionRuleSchema;
export const hrMcpUpsertEmployerContributionRuleFormSchema =
  hrMcpUpsertEmployerContributionRuleSchema;
