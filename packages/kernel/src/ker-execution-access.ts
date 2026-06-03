import type { AppCapability } from "@afenda/auth";
import type { ExecutionContext } from "../context/execution-context";
import { ExecutionAccessDeniedError } from "../errors/execution-errors";

export type ExecutionAccessVerdict = {
  allowed: boolean;
  permission: AppCapability;
  reason?: string;
};

export function resolveExecutionAccessVerdict(
  context: ExecutionContext,
  permission: AppCapability,
): ExecutionAccessVerdict {
  if (context.capabilities.includes(permission)) {
    return {
      allowed: true,
      permission,
    };
  }

  return {
    allowed: false,
    permission,
    reason: `Missing required permission: ${permission}`,
  };
}

export function hasExecutionPermission(
  context: ExecutionContext,
  permission: AppCapability,
) {
  return resolveExecutionAccessVerdict(context, permission).allowed;
}

export function requireExecutionPermission(
  context: ExecutionContext,
  permission: AppCapability,
) {
  const verdict = resolveExecutionAccessVerdict(context, permission);

  if (!verdict.allowed) {
    throw new ExecutionAccessDeniedError(
      verdict.permission,
      verdict.reason,
    );
  }

  return verdict;
}
