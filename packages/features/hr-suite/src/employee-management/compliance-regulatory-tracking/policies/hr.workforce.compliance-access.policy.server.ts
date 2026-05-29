import type { AppCapability } from "@afenda/auth";
import {
  hasExecutionPermission,
  requireExecutionContext,
  requireExecutionPermission,
  type ExecutionContext,
} from "@afenda/kernel/execution";

export type HrComplianceExecutionGuard = {
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

function toHrComplianceExecutionGuard(
  context: ExecutionContext,
): HrComplianceExecutionGuard {
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

export async function requireHrComplianceRead() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, "hr.compliance.read");
  return toHrComplianceExecutionGuard(context);
}

export async function requireHrComplianceWrite() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, "hr.compliance.write");
  return toHrComplianceExecutionGuard(context);
}
