import type { AppCapability } from "@afenda/auth";
import {
  hasExecutionPermission,
  requireExecutionContext,
  requireExecutionPermission,
  type ExecutionContext,
} from "@afenda/kernel/execution";

export type HrLifecycleExecutionGuard = {
  context: ExecutionContext;
  session: { id: string };
  organization: {
    id: string;
    slug: string;
    locale: string;
    role: ExecutionContext["role"];
    capabilities: readonly AppCapability[];
  };
  hasCapability(capability: AppCapability): boolean;
};

function toHrLifecycleExecutionGuard(
  context: ExecutionContext,
): HrLifecycleExecutionGuard {
  return {
    context,
    session: { id: context.userId },
    organization: {
      id: context.organizationId,
      slug: context.organizationSlug,
      locale: context.locale,
      role: context.role,
      capabilities: context.capabilities,
    },
    hasCapability(capability: AppCapability) {
      return hasExecutionPermission(context, capability);
    },
  };
}

export async function requireHrLifecycleRead() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, "hr.lifecycle.read");
  return toHrLifecycleExecutionGuard(context);
}

export async function requireHrLifecycleWrite() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, "hr.lifecycle.write");
  return toHrLifecycleExecutionGuard(context);
}
