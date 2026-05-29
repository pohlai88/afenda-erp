import {
  requireExecutionContext,
  requireExecutionPermission,
  hasExecutionPermission,
} from "@afenda/kernel/execution";

export async function requireHrLifecycleRead() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, "hr.lifecycle.read");

  return {
    context,
    organization: {
      id: context.organizationId,
      slug: context.organizationSlug,
    },
    canWrite: hasExecutionPermission(context, "hr.lifecycle.write"),
  };
}

export async function requireHrLifecycleWrite() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, "hr.lifecycle.write");

  return {
    context,
    organization: {
      id: context.organizationId,
      slug: context.organizationSlug,
    },
  };
}
