import { executionPolicyEffects } from "@afenda/kernel/execution-tenant-policy";
import { z } from "zod";

const booleanFormSchema = z
  .enum(["true", "false"])
  .transform((value) => value === "true");

const policyConditionSchema = z
  .record(z.string(), z.unknown())
  .superRefine((value, context) => {
    if (Object.keys(value).length > 20) {
      context.addIssue({
        code: "custom",
        message: "Policy conditions cannot exceed 20 keys.",
      });
    }
  });

export const policyEffectSchema = z.enum(executionPolicyEffects);

export const policyRuleStatusSchema = z.enum([
  "active",
  "disabled",
  "deprecated",
]);

export const updatePolicyRuleInputSchema = z.object({
  policyRuleId: z.string().trim().min(1).max(120),
  name: z.string().trim().min(1).max(160),
  moduleKey: z.string().trim().min(1).max(80),
  action: z.string().trim().min(1).max(160),
  targetType: z.string().trim().min(1).max(80),
  effect: policyEffectSchema,
  conditionJson: z
    .string()
    .max(4000)
    .transform((value, context) => {
      if (!value.trim()) {
        return {};
      }

      try {
        const parsed: unknown = JSON.parse(value);
        const result = policyConditionSchema.safeParse(parsed);
        if (!result.success) {
          context.addIssue({
            code: "custom",
            message: "Policy condition must be a JSON object.",
          });
          return z.NEVER;
        }
        return result.data;
      } catch {
        context.addIssue({
          code: "custom",
          message: "Policy condition must be valid JSON.",
        });
        return z.NEVER;
      }
    }),
  status: policyRuleStatusSchema,
  priority: z.coerce.number().int().min(0).max(1000),
  enabled: booleanFormSchema,
});

export const createPolicyRuleInputSchema = updatePolicyRuleInputSchema.omit({
  policyRuleId: true,
}).extend({
  policyKey: z.string().trim().min(1).max(120),
});

export const systemAdminPolicyRuleActionSchema = z.discriminatedUnion("mode", [
  createPolicyRuleInputSchema.extend({ mode: z.literal("create") }),
  updatePolicyRuleInputSchema.extend({ mode: z.literal("update") }),
]);
