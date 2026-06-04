import type { ExecutionContext } from "./ker-execution-context";
import {
  ExecutionPolicyApprovalRequiredError,
  ExecutionPolicyDeniedError,
} from "./ker-execution-errors";
import type {
  ExecutionPolicyCheck,
  ExecutionPolicyVerdict,
} from "./ker-execution-policy-types";

type MaybePromise<T> = T | Promise<T>;

export type { ExecutionPolicyCheck, ExecutionPolicyVerdict } from "./ker-execution-policy-types";
export type { ExecutionPolicyEffect } from "./ker-tenant-execution-rules";
export {
  executionPolicyEffects,
  findMatchingTenantApprovalRule,
  findMatchingTenantPolicyRule,
  isTenantApprovalRuleActive,
  isTenantPolicyRuleActive,
  resolveTenantExecutionPolicyVerdict,
  type TenantApprovalRuleRecord,
  type TenantPolicyRuleRecord,
} from "./ker-tenant-execution-rules";

export type ExecutionPolicyEvaluator = (input: {
  context: ExecutionContext;
  policy: ExecutionPolicyCheck;
}) => MaybePromise<ExecutionPolicyVerdict | null | undefined>;

const executionPolicyRegistry = new Map<string, ExecutionPolicyEvaluator[]>();
const tenantExecutionPolicyEvaluators: ExecutionPolicyEvaluator[] = [];

export function registerTenantExecutionPolicyEvaluator(
  evaluator: ExecutionPolicyEvaluator,
) {
  tenantExecutionPolicyEvaluators.push(evaluator);
}

export function resetTenantExecutionPolicyEvaluatorsForTest() {
  tenantExecutionPolicyEvaluators.length = 0;
}

export function defineExecutionPolicy(
  action: string | readonly string[],
  evaluator: ExecutionPolicyEvaluator,
) {
  const actions = Array.isArray(action) ? action : [action];

  for (const currentAction of actions) {
    const evaluators = executionPolicyRegistry.get(currentAction) ?? [];
    evaluators.push(evaluator);
    executionPolicyRegistry.set(currentAction, evaluators);
  }
}

export function resetExecutionPolicyRegistryForTest() {
  executionPolicyRegistry.clear();
  resetTenantExecutionPolicyEvaluatorsForTest();
}

export async function resolveExecutionPolicyVerdict(
  context: ExecutionContext,
  policy: ExecutionPolicyCheck,
) {
  const evaluators = [
    ...(executionPolicyRegistry.get(policy.action) ?? []),
    ...tenantExecutionPolicyEvaluators,
  ];

  for (const evaluator of evaluators) {
    const verdict = await evaluator({ context, policy });
    if (!verdict) {
      continue;
    }

    if (!verdict.allowed) {
      return {
        allowed: false,
        action: verdict.action,
        targetType: verdict.targetType,
        targetId: verdict.targetId,
        reason: verdict.reason,
        effect: verdict.effect,
        policyRuleId: verdict.policyRuleId,
        approvalRuleId: verdict.approvalRuleId,
      } satisfies ExecutionPolicyVerdict;
    }

    if (verdict.effect === "warn") {
      return {
        allowed: true,
        action: verdict.action,
        targetType: verdict.targetType,
        targetId: verdict.targetId,
        reason: verdict.reason,
        effect: verdict.effect,
        policyRuleId: verdict.policyRuleId,
        approvalRuleId: verdict.approvalRuleId,
      } satisfies ExecutionPolicyVerdict;
    }
  }

  return {
    allowed: true,
    action: policy.action,
    targetType: policy.targetType,
    targetId: policy.targetId,
    effect: "allow",
  } satisfies ExecutionPolicyVerdict;
}

export async function assertExecutionPolicy(
  context: ExecutionContext,
  policy: ExecutionPolicyCheck,
) {
  const verdict = await resolveExecutionPolicyVerdict(context, policy);

  if (!verdict.allowed) {
    if (verdict.effect === "require_approval") {
      throw new ExecutionPolicyApprovalRequiredError(
        verdict.action,
        verdict.targetType,
        verdict.targetId,
        verdict.reason,
        verdict.policyRuleId,
        verdict.approvalRuleId,
      );
    }

    throw new ExecutionPolicyDeniedError(
      verdict.action,
      verdict.targetType,
      verdict.targetId,
      verdict.reason,
      verdict.effect === "lock" ? "lock" : "deny",
      verdict.policyRuleId,
      verdict.approvalRuleId,
    );
  }

  return verdict;
}
