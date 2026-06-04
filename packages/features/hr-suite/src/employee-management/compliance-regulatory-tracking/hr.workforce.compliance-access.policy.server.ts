import type { AppCapability } from "@afenda/kernel";
import {
  hasExecutionPermission,
  requireExecutionContext,
  requireExecutionPermission,
  type ExecutionContext,
} from "@afenda/kernel/execution";

import { HR_COMPLIANCE_SENSITIVE_READ_CAPABILITY } from "./hr.workforce.compliance-sensitive-access.shared";
import { HrComplianceSensitiveAccessError } from "./hr.workforce.compliance-org-scope.shared";

export type HrComplianceExecutionGuard = {
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

function toHrComplianceExecutionGuard(
  context: ExecutionContext,
): HrComplianceExecutionGuard {
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
      HR_COMPLIANCE_SENSITIVE_READ_CAPABILITY,
    ),
    hasCapability(capability: AppCapability) {
      return hasExecutionPermission(context, capability);
    },
  };
}

export async function requireHrComplianceRead() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, "hr.compliance.read");
  return toHrComplianceExecutionGuard(context);
}

export async function requireHrComplianceWrite() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, "hr.compliance.write");
  return toHrComplianceExecutionGuard(context);
}

/** HRM-CMP-024 — sensitive register mutations require write plus sensitive read. */
export async function requireHrComplianceSensitiveWrite() {
  const guard = await requireHrComplianceWrite();
  if (!guard.canViewSensitive) {
    throw new HrComplianceSensitiveAccessError();
  }
  return guard;
}
