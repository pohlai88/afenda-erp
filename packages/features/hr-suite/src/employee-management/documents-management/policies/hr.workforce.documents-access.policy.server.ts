import type { AppCapability } from "@afenda/auth";
import {
  hasExecutionPermission,
  requireExecutionContext,
  requireExecutionPermission,
  type ExecutionContext,
} from "@afenda/kernel/execution";

import { HR_DOCUMENTS_SENSITIVE_READ_CAPABILITY } from "../data/hr.workforce.documents-sensitive-access.shared";
import { HrDocumentsSensitiveAccessError } from "../data/hr.workforce.documents-org-scope.shared";

export type HrDocumentsExecutionGuard = {
  context: ExecutionContext;
  session: { id: string };
  organization: {
    id: string;
    slug: string;
    locale: string;
    role: ExecutionContext["role"];
    capabilities: readonly AppCapability[];
  };
  canViewSensitive: boolean;
  hasCapability(capability: AppCapability): boolean;
};

function toHrDocumentsExecutionGuard(
  context: ExecutionContext,
): HrDocumentsExecutionGuard {
  return {
    context,
    session: { id: context.userId },
    organization: {
      id: context.organizationId,
      slug: context.organizationSlug,
      locale: context.locale,
      role: context.role,
      capabilities: context.capabilities,
    },
    canViewSensitive: hasExecutionPermission(
      context,
      HR_DOCUMENTS_SENSITIVE_READ_CAPABILITY,
    ),
    hasCapability(capability: AppCapability) {
      return hasExecutionPermission(context, capability);
    },
  };
}

export async function requireHrDocumentsRead() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, "hr.documents.read");
  return toHrDocumentsExecutionGuard(context);
}

export async function requireHrDocumentsWrite() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, "hr.documents.write");
  return toHrDocumentsExecutionGuard(context);
}

export async function requireHrDocumentsSensitiveWrite() {
  const guard = await requireHrDocumentsWrite();
  if (!guard.canViewSensitive) {
    throw new HrDocumentsSensitiveAccessError();
  }
  return guard;
}
