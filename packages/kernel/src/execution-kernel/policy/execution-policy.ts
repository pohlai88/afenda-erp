import type { ExecutionContext } from "../context/execution-context";
import { ExecutionPolicyDeniedError } from "../errors/execution-errors";

type MaybePromise<T> = T | Promise<T>;

export type ExecutionPolicyCheck = {
  action: string;
  targetType: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
};

export type ExecutionPolicyVerdict = {
  allowed: boolean;
  action: string;
  targetType: string;
  targetId?: string;
  reason?: string;
};

export type ExecutionPolicyEvaluator = (input: {
  context: ExecutionContext;
  policy: ExecutionPolicyCheck;
}) => MaybePromise<ExecutionPolicyVerdict | null | undefined>;

const executionPolicyRegistry = new Map<string, ExecutionPolicyEvaluator[]>();

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
}

export async function resolveExecutionPolicyVerdict(
  context: ExecutionContext,
  policy: ExecutionPolicyCheck,
) {
  const evaluators = executionPolicyRegistry.get(policy.action) ?? [];

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
      } satisfies ExecutionPolicyVerdict;
    }
  }

  return {
    allowed: true,
    action: policy.action,
    targetType: policy.targetType,
    targetId: policy.targetId,
  } satisfies ExecutionPolicyVerdict;
}

export async function assertExecutionPolicy(
  context: ExecutionContext,
  policy: ExecutionPolicyCheck,
) {
  const verdict = await resolveExecutionPolicyVerdict(context, policy);

  if (!verdict.allowed) {
    throw new ExecutionPolicyDeniedError(
      verdict.action,
      verdict.targetType,
      verdict.targetId,
      verdict.reason,
    );
  }

  return verdict;
}
