import {
  hasExecutionPermission,
  requireExecutionContext,
  requireExecutionPermission,
} from "@afenda/kernel/execution";

export async function requireHrOffboardingRead() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, "hr.offboarding.read");

  return {
    context,
    organization: {
      id: context.organizationId,
      slug: context.organizationSlug,
    },
    canWrite: hasExecutionPermission(context, "hr.offboarding.write"),
  };
}

export async function requireHrOffboardingWrite() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, "hr.offboarding.write");

  return {
    context,
    organization: {
      id: context.organizationId,
      slug: context.organizationSlug,
    },
  };
}
