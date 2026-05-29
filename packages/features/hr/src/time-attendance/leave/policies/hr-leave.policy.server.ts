import {
  hasExecutionPermission,
  requireExecutionContext,
  requireExecutionPermission,
} from "@afenda/kernel/execution";

export async function requireHrLeaveRead() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, "hr.leave.read");

  return {
    context,
    organization: {
      id: context.organizationId,
      slug: context.organizationSlug,
    },
    canWrite: hasExecutionPermission(context, "hr.leave.write"),
  };
}

export async function requireHrLeaveWrite() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, "hr.leave.write");

  return {
    context,
    organization: {
      id: context.organizationId,
      slug: context.organizationSlug,
    },
  };
}
