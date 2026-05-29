import {
  hasExecutionPermission,
  requireExecutionContext,
  requireExecutionPermission,
} from "@afenda/kernel/execution";

export async function requireHrShiftsRead() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, "hr.shifts.read");

  return {
    context,
    organization: {
      id: context.organizationId,
      slug: context.organizationSlug,
    },
    canWrite: hasExecutionPermission(context, "hr.shifts.write"),
  };
}

export async function requireHrShiftsWrite() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, "hr.shifts.write");

  return {
    context,
    organization: {
      id: context.organizationId,
      slug: context.organizationSlug,
    },
  };
}
