import {
  hasExecutionPermission,
  requireExecutionContext,
  requireExecutionPermission,
} from "@afenda/kernel/execution";

export async function requireHrEmployeesRead() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, "hr.view");

  return {
    context,
    organization: {
      id: context.organizationId,
      slug: context.organizationSlug,
    },
    canWrite: hasExecutionPermission(context, "hr.employees.write"),
    canViewLifecycle: hasExecutionPermission(context, "hr.lifecycle.read"),
  };
}

export async function requireHrEmployeesWrite() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, "hr.employees.write");

  return {
    context,
    organization: {
      id: context.organizationId,
      slug: context.organizationSlug,
    },
  };
}
