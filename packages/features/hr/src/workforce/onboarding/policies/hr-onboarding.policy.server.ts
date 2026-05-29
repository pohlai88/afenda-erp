import {
  hasExecutionPermission,
  requireExecutionContext,
  requireExecutionPermission,
} from "@afenda/kernel/execution";

export async function requireHrOnboardingRead() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, "hr.onboarding.read");

  return {
    context,
    organization: {
      id: context.organizationId,
      slug: context.organizationSlug,
    },
    canWrite: hasExecutionPermission(context, "hr.onboarding.write"),
  };
}

export async function requireHrOnboardingWrite() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, "hr.onboarding.write");

  return {
    context,
    organization: {
      id: context.organizationId,
      slug: context.organizationSlug,
    },
  };
}
