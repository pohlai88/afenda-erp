import type {
  ExecutionPolicyCheck,
  ExecutionPolicyVerdict,
} from "./execution-policy-types";

export const executionPolicyEffects = [
  "allow",
  "deny",
  "lock",
  "require_approval",
  "warn",
] as const;

export type ExecutionPolicyEffect = (typeof executionPolicyEffects)[number];

export type TenantPolicyRuleRecord = {
  id: string;
  key: string;
  moduleKey: string;
  action: string;
  targetType: string;
  effect: ExecutionPolicyEffect;
  condition: Record<string, unknown>;
  status: "active" | "disabled" | "deprecated";
  priority: number;
};

export type TenantApprovalRuleRecord = {
  id: string;
  key: string;
  moduleKey: string;
  action: string;
  targetType: string;
  approvalMode: "sequential" | "parallel";
  approverRoleKeys: readonly string[];
  minApprovals: number;
  escalationAfterHours?: number;
  escalationBehavior?: "notify" | "reassign" | "expire";
  escalationRoleKeys?: readonly string[];
  delegateToRoleKeys?: readonly string[];
  delegationValidDays?: number;
  status: "active" | "disabled" | "deprecated";
};

export function isTenantPolicyRuleActive(rule: TenantPolicyRuleRecord) {
  return rule.status === "active";
}

export function isTenantApprovalRuleActive(rule: TenantApprovalRuleRecord) {
  return rule.status === "active";
}

function matchesPolicyCondition(
  condition: Record<string, unknown>,
  attributes: Record<string, unknown> | undefined,
) {
  const entries = Object.entries(condition);
  if (entries.length === 0) {
    return true;
  }

  if (!attributes) {
    return false;
  }

  return entries.every(([key, expected]) => attributes[key] === expected);
}

function matchesExecutionTarget(
  rule: { moduleKey: string; action: string; targetType: string },
  policy: ExecutionPolicyCheck,
) {
  if (rule.action !== policy.action || rule.targetType !== policy.targetType) {
    return false;
  }

  if (rule.moduleKey === "*" || rule.moduleKey.length === 0) {
    return true;
  }

  const moduleKey =
    typeof policy.metadata?.moduleKey === "string"
      ? policy.metadata.moduleKey
      : undefined;

  return moduleKey === undefined || moduleKey === rule.moduleKey;
}

export function findMatchingTenantPolicyRule(
  rules: readonly TenantPolicyRuleRecord[],
  input: {
    policy: ExecutionPolicyCheck;
    attributes?: Record<string, unknown>;
  },
) {
  return [...rules]
    .filter(isTenantPolicyRuleActive)
    .filter((rule) => matchesExecutionTarget(rule, input.policy))
    .filter((rule) =>
      matchesPolicyCondition(rule.condition, input.attributes),
    )
    .sort((left, right) => right.priority - left.priority)[0];
}

export function findMatchingTenantApprovalRule(
  rules: readonly TenantApprovalRuleRecord[],
  policy: ExecutionPolicyCheck,
) {
  return rules.find(
    (rule) =>
      isTenantApprovalRuleActive(rule) && matchesExecutionTarget(rule, policy),
  );
}

function toVerdict(
  policy: ExecutionPolicyCheck,
  input: {
    allowed: boolean;
    effect: ExecutionPolicyEffect;
    reason?: string;
    policyRuleId?: string;
    approvalRuleId?: string;
  },
): ExecutionPolicyVerdict {
  return {
    allowed: input.allowed,
    effect: input.effect,
    action: policy.action,
    targetType: policy.targetType,
    targetId: policy.targetId,
    reason: input.reason,
    policyRuleId: input.policyRuleId,
    approvalRuleId: input.approvalRuleId,
  };
}

export function resolveTenantExecutionPolicyVerdict(input: {
  policy: ExecutionPolicyCheck;
  policyRules: readonly TenantPolicyRuleRecord[];
  approvalRules: readonly TenantApprovalRuleRecord[];
  attributes?: Record<string, unknown>;
}): ExecutionPolicyVerdict | null {
  const matchedPolicy = findMatchingTenantPolicyRule(input.policyRules, {
    policy: input.policy,
    attributes: input.attributes,
  });

  if (matchedPolicy) {
    switch (matchedPolicy.effect) {
      case "deny":
        return toVerdict(input.policy, {
          allowed: false,
          effect: "deny",
          reason: `Policy rule ${matchedPolicy.key} denied this action.`,
          policyRuleId: matchedPolicy.id,
        });
      case "lock":
        return toVerdict(input.policy, {
          allowed: false,
          effect: "lock",
          reason: `Policy rule ${matchedPolicy.key} locked this target.`,
          policyRuleId: matchedPolicy.id,
        });
      case "require_approval":
        return toVerdict(input.policy, {
          allowed: false,
          effect: "require_approval",
          reason: `Policy rule ${matchedPolicy.key} requires approval.`,
          policyRuleId: matchedPolicy.id,
        });
      case "warn":
        return toVerdict(input.policy, {
          allowed: true,
          effect: "warn",
          reason: `Policy rule ${matchedPolicy.key} raised a warning.`,
          policyRuleId: matchedPolicy.id,
        });
      case "allow":
        return toVerdict(input.policy, {
          allowed: true,
          effect: "allow",
          policyRuleId: matchedPolicy.id,
        });
      default: {
        const _exhaustive: never = matchedPolicy.effect;
        return _exhaustive;
      }
    }
  }

  const matchedApproval = findMatchingTenantApprovalRule(
    input.approvalRules,
    input.policy,
  );

  if (matchedApproval) {
    return toVerdict(input.policy, {
      allowed: false,
      effect: "require_approval",
      reason: `Approval rule ${matchedApproval.key} requires approval.`,
      approvalRuleId: matchedApproval.id,
    });
  }

  return null;
}
