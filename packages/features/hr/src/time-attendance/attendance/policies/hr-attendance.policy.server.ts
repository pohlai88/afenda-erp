import {
  hasExecutionPermission,
  requireExecutionContext,
  requireExecutionPermission,
} from "@afenda/kernel/execution";

export async function requireHrAttendanceRead() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, "hr.attendance.read");

  return {
    context,
    organization: {
      id: context.organizationId,
      slug: context.organizationSlug,
    },
    canWrite: hasExecutionPermission(context, "hr.attendance.write"),
  };
}

export async function requireHrAttendanceWrite() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, "hr.attendance.write");

  return {
    context,
    organization: {
      id: context.organizationId,
      slug: context.organizationSlug,
    },
  };
}
