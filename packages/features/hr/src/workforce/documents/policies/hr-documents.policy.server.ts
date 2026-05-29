import {
  requireExecutionContext,
  requireExecutionPermission,
  hasExecutionPermission,
} from "@afenda/kernel/execution";

export async function requireHrDocumentsRead() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, "hr.documents.read");

  return {
    context,
    organization: {
      id: context.organizationId,
      slug: context.organizationSlug,
    },
    canWrite: hasExecutionPermission(context, "hr.documents.write"),
  };
}

export async function requireHrDocumentsWrite() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, "hr.documents.write");

  return {
    context,
    organization: {
      id: context.organizationId,
      slug: context.organizationSlug,
    },
  };
}
