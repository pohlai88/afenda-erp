import type { AppCapability } from "@afenda/kernel";
import {
  hasExecutionPermission,
  requireExecutionContext,
  requireExecutionPermission,
  type ExecutionContext,
} from "@afenda/kernel/execution";

export type HrOrgExecutionGuard = {
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

function toHrOrgExecutionGuard(context: ExecutionContext): HrOrgExecutionGuard {
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

export async function requireHrOrgRead() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, "hr.org.read");
  return toHrOrgExecutionGuard(context);
}

export async function requireHrOrgWrite() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, "hr.org.write");
  return toHrOrgExecutionGuard(context);
}
