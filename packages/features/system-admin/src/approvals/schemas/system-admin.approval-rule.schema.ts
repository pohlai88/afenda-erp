import { organizationRoles } from "@afenda/auth";
import { z } from "zod";

const booleanFormSchema = z
  .enum(["true", "false"])
  .transform((value) => value === "true");

export const approvalRuleStatusSchema = z.enum([
  "active",
  "disabled",
  "deprecated",
]);

export const updateApprovalRuleInputSchema = z.object({
  approvalRuleId: z.string().trim().min(1).max(120),
  name: z.string().trim().min(1).max(160),
  moduleKey: z.string().trim().min(1).max(80),
  action: z.string().trim().min(1).max(160),
  targetType: z.string().trim().min(1).max(80),
  approverRoleKeys: z
    .string()
    .max(500)
    .transform((value, context) => {
      const roles = value
        .split(",")
        .map((role) => role.trim())
        .filter(Boolean);
      const parsed = z
        .array(z.enum(organizationRoles))
        .min(1)
        .safeParse(roles);

      if (!parsed.success) {
        context.addIssue({
          code: "custom",
          message: "At least one valid approver role is required.",
        });
        return z.NEVER;
      }

      return parsed.data;
    }),
  minApprovals: z.coerce.number().int().min(1).max(10),
  escalationAfterHours: z.coerce
    .number()
    .int()
    .min(1)
    .max(720)
    .optional(),
  status: approvalRuleStatusSchema,
  enabled: booleanFormSchema,
});

export const createApprovalRuleInputSchema =
  updateApprovalRuleInputSchema.omit({ approvalRuleId: true }).extend({
    approvalKey: z.string().trim().min(1).max(120),
  });

export const systemAdminApprovalRuleActionSchema = z.discriminatedUnion("mode", [
  createApprovalRuleInputSchema.extend({ mode: z.literal("create") }),
  updateApprovalRuleInputSchema.extend({ mode: z.literal("update") }),
]);
