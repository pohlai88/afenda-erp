import { organizationRoles } from "@afenda/auth";
import { z } from "zod";
import {
  APPROVAL_RULE_DELEGATION_VALID_DAYS_MAX,
  APPROVAL_RULE_DELEGATION_VALID_DAYS_MIN,
  APPROVAL_RULE_ESCALATION_HOURS_MAX,
  APPROVAL_RULE_ESCALATION_HOURS_MIN,
  APPROVAL_RULE_FIELD_MAX_LENGTH,
  APPROVAL_RULE_KEY_MAX_LENGTH,
  APPROVAL_RULE_MIN_APPROVALS_MAX,
  APPROVAL_RULE_MIN_APPROVALS_MIN,
  APPROVAL_RULE_NAME_MAX_LENGTH,
  APPROVAL_RULE_ROLE_KEYS_INPUT_MAX_LENGTH,
} from "../contracts/system-admin.approval-rule.limits.shared";

const booleanFormSchema = z
  .enum(["true", "false"])
  .transform((value) => value === "true");

export const approvalRuleStatusSchema = z.enum([
  "active",
  "disabled",
  "deprecated",
]);

export const approvalModeSchema = z.enum(["sequential", "parallel"]);

export const escalationBehaviorSchema = z.enum(["notify", "reassign", "expire"]);

function parseCommaSeparatedRoles(
  value: string,
  context: z.RefinementCtx,
  message: string,
  options?: { min?: number },
) {
  const roles = value
    .split(",")
    .map((role) => role.trim())
    .filter(Boolean);
  const parsed = z.array(z.enum(organizationRoles)).safeParse(roles);

  if (!parsed.success) {
    context.addIssue({ code: "custom", message });
    return z.NEVER;
  }

  if (options?.min && parsed.data.length < options.min) {
    context.addIssue({ code: "custom", message });
    return z.NEVER;
  }

  return parsed.data;
}

const approverRoleKeysSchema = z
  .string()
  .max(APPROVAL_RULE_ROLE_KEYS_INPUT_MAX_LENGTH)
  .transform((value, context) =>
    parseCommaSeparatedRoles(
      value,
      context,
      "At least one valid approver role is required.",
      { min: 1 },
    ),
  );

const delegateRoleKeysSchema = z
  .string()
  .max(APPROVAL_RULE_ROLE_KEYS_INPUT_MAX_LENGTH)
  .optional()
  .transform((value, context) => {
    if (!value?.trim()) {
      return [] as (typeof organizationRoles)[number][];
    }

    return parseCommaSeparatedRoles(
      value,
      context,
      "Delegation roles must use valid organization roles.",
    );
  });

const escalationRoleKeysSchema = z
  .string()
  .max(APPROVAL_RULE_ROLE_KEYS_INPUT_MAX_LENGTH)
  .optional()
  .transform((value, context) => {
    if (!value?.trim()) {
      return [] as (typeof organizationRoles)[number][];
    }

    return parseCommaSeparatedRoles(
      value,
      context,
      "Escalation roles must use valid organization roles.",
    );
  });

const approvalRuleCoreSchema = z.object({
  name: z.string().trim().min(1).max(APPROVAL_RULE_NAME_MAX_LENGTH),
  moduleKey: z.string().trim().min(1).max(APPROVAL_RULE_FIELD_MAX_LENGTH),
  action: z.string().trim().min(1).max(APPROVAL_RULE_NAME_MAX_LENGTH),
  targetType: z.string().trim().min(1).max(APPROVAL_RULE_FIELD_MAX_LENGTH),
  approvalMode: approvalModeSchema,
  approverRoleKeys: approverRoleKeysSchema,
  delegateToRoleKeys: delegateRoleKeysSchema,
  delegationValidDays: z.coerce
    .number()
    .int()
    .min(APPROVAL_RULE_DELEGATION_VALID_DAYS_MIN)
    .max(APPROVAL_RULE_DELEGATION_VALID_DAYS_MAX)
    .optional(),
  minApprovals: z.coerce
    .number()
    .int()
    .min(APPROVAL_RULE_MIN_APPROVALS_MIN)
    .max(APPROVAL_RULE_MIN_APPROVALS_MAX),
  escalationAfterHours: z.coerce
    .number()
    .int()
    .min(APPROVAL_RULE_ESCALATION_HOURS_MIN)
    .max(APPROVAL_RULE_ESCALATION_HOURS_MAX)
    .optional(),
  escalationBehavior: escalationBehaviorSchema.optional(),
  escalationRoleKeys: escalationRoleKeysSchema,
  status: approvalRuleStatusSchema,
  enabled: booleanFormSchema,
});

function refineApprovalRuleInput(
  value: {
    approvalMode: z.infer<typeof approvalModeSchema>;
    approverRoleKeys: (typeof organizationRoles)[number][];
    delegateToRoleKeys: (typeof organizationRoles)[number][];
    delegationValidDays?: number;
    minApprovals: number;
    escalationAfterHours?: number;
    escalationBehavior?: z.infer<typeof escalationBehaviorSchema>;
    escalationRoleKeys: (typeof organizationRoles)[number][];
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

  if (value.delegateToRoleKeys.length > 0 && !value.delegationValidDays) {
    context.addIssue({
      code: "custom",
      message:
        "Delegation valid days are required when delegation roles are configured.",
      path: ["delegationValidDays"],
    });
  }

  if (value.escalationAfterHours && !value.escalationBehavior) {
    context.addIssue({
      code: "custom",
      message: "Escalation behavior is required when escalation hours are set.",
      path: ["escalationBehavior"],
    });
  }

  if (
    value.escalationBehavior === "reassign" &&
    value.escalationRoleKeys.length === 0
  ) {
    context.addIssue({
      code: "custom",
      message:
        "At least one escalation role is required when behavior is reassign.",
      path: ["escalationRoleKeys"],
    });
  }
}

export const updateApprovalRuleInputSchema = approvalRuleCoreSchema
  .extend({
    approvalRuleId: z.string().trim().min(1).max(APPROVAL_RULE_KEY_MAX_LENGTH),
  })
  .superRefine(refineApprovalRuleInput);

export const createApprovalRuleInputSchema = approvalRuleCoreSchema
  .extend({
    approvalKey: z.string().trim().min(1).max(APPROVAL_RULE_KEY_MAX_LENGTH),
  })
  .superRefine(refineApprovalRuleInput);

export const systemAdminApprovalRuleActionSchema = z.discriminatedUnion("mode", [
  createApprovalRuleInputSchema.extend({ mode: z.literal("create") }),
  updateApprovalRuleInputSchema.extend({ mode: z.literal("update") }),
]);

export type SystemAdminApprovalRuleActionInput = z.infer<
  typeof systemAdminApprovalRuleActionSchema
>;
