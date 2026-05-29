import {
  hasExecutionPermission,
  requireExecutionContext,
  requireExecutionPermission,
} from "@afenda/kernel/execution";

export async function requireHrComplianceRead() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, "hr.compliance.read");

  return {
    context,
    organization: {
      id: context.organizationId,
      slug: context.organizationSlug,
    },
    canWrite: hasExecutionPermission(context, "hr.compliance.write"),
  };
}

export async function requireHrComplianceWrite() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, "hr.compliance.write");

  return {
    context,
    organization: {
      id: context.organizationId,
      slug: context.organizationSlug,
    },
  };
}
