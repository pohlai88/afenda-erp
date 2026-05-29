import {
  hasExecutionPermission,
  requireExecutionContext,
  requireExecutionPermission,
} from "@afenda/kernel/execution";

export async function requireHrOvertimeRead() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, "hr.overtime.read");

  return {
    context,
    organization: {
      id: context.organizationId,
      slug: context.organizationSlug,
    },
    canWrite: hasExecutionPermission(context, "hr.overtime.write"),
  };
}

export async function requireHrOvertimeWrite() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, "hr.overtime.write");

  return {
    context,
    organization: {
      id: context.organizationId,
      slug: context.organizationSlug,
    },
  };
}
