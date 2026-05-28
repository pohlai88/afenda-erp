import type { AppCapability } from "@afenda/auth";
import {
  requireExecutionContext,
  type ExecutionContext,
} from "../context/execution-context";
import { requireExecutionPermission } from "../access/execution-access";
import {
  assertExecutionPolicy,
  type ExecutionPolicyCheck,
} from "../policy/execution-policy";
import { writeExecutionAuditEvent } from "../audit/execution-audit";
import type { ExecutionActorType } from "../actor/execution-actor";

type MaybePromise<T> = T | Promise<T>;

export type ExecutionTarget = {
  targetType: string;
  targetId?: string;
};

export type GuardedExecutionDefinition<TInput, TParsed, TResult> = {
  action: string;
  permission: AppCapability;
  input: TInput;
  actorType?: ExecutionActorType;
  parse: (input: TInput) => MaybePromise<TParsed>;
  resolveTarget: (input: TParsed) => ExecutionTarget;
  execute: (input: {
    context: ExecutionContext;
    input: TParsed;
    target: ExecutionTarget;
  }) => Promise<TResult>;
  policy?: Omit<ExecutionPolicyCheck, "action" | "targetType" | "targetId">;
  audit?: {
    metadata?: Record<string, unknown>;
    reason?: string;
    summary?: string;
    skip?: boolean;
  };
  revalidate?: (input: {
    context: ExecutionContext;
    input: TParsed;
    target: ExecutionTarget;
    result: TResult;
  }) => MaybePromise<void>;
};

export async function runGuardedExecution<TInput, TParsed, TResult>(
  definition: GuardedExecutionDefinition<TInput, TParsed, TResult>,
) {
  const context = await requireExecutionContext({
    actorType: definition.actorType,
  });
  const parsed = await definition.parse(definition.input);

  requireExecutionPermission(context, definition.permission);

  const target = definition.resolveTarget(parsed);

  await assertExecutionPolicy(context, {
    action: definition.action,
    targetType: target.targetType,
    targetId: target.targetId,
    metadata: definition.policy?.metadata,
  });

  const result = await definition.execute({
    context,
    input: parsed,
    target,
  });

  if (!definition.audit?.skip) {
    await writeExecutionAuditEvent({
      organizationId: context.organizationId,
      actorId: context.userId,
      actorType: context.actorType,
      action: definition.action,
      targetType: target.targetType,
      targetId: target.targetId,
      reason: definition.audit?.reason,
      summary: definition.audit?.summary,
      metadata: definition.audit?.metadata,
    });
  }

  await definition.revalidate?.({
    context,
    input: parsed,
    target,
    result,
  });

  return result;
}
