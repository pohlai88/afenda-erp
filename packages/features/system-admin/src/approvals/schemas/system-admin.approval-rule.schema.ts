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

export const approvalModeSchema = z.enum(["sequential", "parallel"]);

const approverRoleKeysSchema = z
  .string()
  .max(500)
  .transform((value, context) => {
    const roles = value
      .split(",")
      .map((role) => role.trim())
      .filter(Boolean);
    const parsed = z.array(z.enum(organizationRoles)).min(1).safeParse(roles);

    if (!parsed.success) {
      context.addIssue({
        code: "custom",
        message: "At least one valid approver role is required.",
      });
      return z.NEVER;
    }

    return parsed.data;
  });

const delegateRoleKeysSchema = z
  .string()
  .max(500)
  .optional()
  .transform((value) => {
    if (!value?.trim()) {
      return [] as (typeof organizationRoles)[number][];
    }

    const roles = value
      .split(",")
      .map((role) => role.trim())
      .filter(Boolean);

    return z.array(z.enum(organizationRoles)).parse(roles);
  });

const approvalRuleCoreSchema = z.object({
  name: z.string().trim().min(1).max(160),
  moduleKey: z.string().trim().min(1).max(80),
  action: z.string().trim().min(1).max(160),
  targetType: z.string().trim().min(1).max(80),
  approvalMode: approvalModeSchema,
  approverRoleKeys: approverRoleKeysSchema,
  delegateToRoleKeys: delegateRoleKeysSchema,
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

function refineApprovalCounts(
  value: {
    approvalMode: z.infer<typeof approvalModeSchema>;
    approverRoleKeys: (typeof organizationRoles)[number][];
    minApprovals: number;
  },
  context: z.RefinementCtx,
) {
  if (value.minApprovals > value.approverRoleKeys.length) {
    context.addIssue({
      code: "custom",
      message:
        "Minimum approvals cannot exceed the number of configured approver roles.",
      path: ["minApprovals"],
    });
  }

  if (
    value.approvalMode === "sequential" &&
    value.minApprovals > 1 &&
    value.approverRoleKeys.length < value.minApprovals
  ) {
    context.addIssue({
      code: "custom",
      message:
        "Sequential approval chains need at least one approver role per required step.",
      path: ["approverRoleKeys"],
    });
  }
}

export const updateApprovalRuleInputSchema = approvalRuleCoreSchema
  .extend({
    approvalRuleId: z.string().trim().min(1).max(120),
  })
  .superRefine(refineApprovalCounts);

export const createApprovalRuleInputSchema = approvalRuleCoreSchema
  .extend({
    approvalKey: z.string().trim().min(1).max(120),
  })
  .superRefine(refineApprovalCounts);

export const systemAdminApprovalRuleActionSchema = z.discriminatedUnion("mode", [
  createApprovalRuleInputSchema.extend({ mode: z.literal("create") }),
  updateApprovalRuleInputSchema.extend({ mode: z.literal("update") }),
]);
