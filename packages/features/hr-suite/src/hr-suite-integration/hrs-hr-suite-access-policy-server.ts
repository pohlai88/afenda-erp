import type { AppCapability } from "@afenda/auth";
import {
  hasExecutionPermission,
  requireExecutionContext,
  requireExecutionPermission,
  type ExecutionContext,
} from "@afenda/kernel/execution";

export type HrModuleExecutionGuard = {
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

export type HrModuleCapabilityRequirementMode = "all" | "any";

export function buildHrModuleExecutionGuard(
  context: ExecutionContext,
): HrModuleExecutionGuard {
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

export async function requireHrCapability(capability: AppCapability) {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, capability);
  return buildHrModuleExecutionGuard(context);
}

export async function requireHrCapabilities(
  capabilities: readonly AppCapability[],
  mode: HrModuleCapabilityRequirementMode = "all",
) {
  const firstCapability = capabilities[0];
  if (!firstCapability) {
    throw new Error("At least one HR capability is required.");
  }

  const context = await requireExecutionContext();
  if (mode === "all") {
    for (const capability of capabilities) {
      requireExecutionPermission(context, capability);
    }
    return buildHrModuleExecutionGuard(context);
  }

  if (
    !capabilities.some((capability) =>
      hasExecutionPermission(context, capability),
    )
  ) {
    requireExecutionPermission(context, firstCapability);
  }

  return buildHrModuleExecutionGuard(context);
}

export async function requireHrRead() {
  return requireHrCapability("hr.view");
}
