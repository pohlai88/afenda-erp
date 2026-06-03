import type { AppCapability } from "@afenda/auth";
import {
  hasExecutionPermission,
  requireExecutionContext,
  requireExecutionPermission,
  type ExecutionContext,
} from "@afenda/kernel/execution";

import { HR_BENEFITS_SENSITIVE_READ_CAPABILITY } from "./hr.payroll.benefits-sensitive-access.shared";
import { HrBenefitsSensitiveAccessError } from "./hr.payroll.benefits-org-scope.shared";

export type HrBenefitsExecutionGuard = {
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

function toHrBenefitsExecutionGuard(
  context: ExecutionContext,
): HrBenefitsExecutionGuard {
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
      HR_BENEFITS_SENSITIVE_READ_CAPABILITY,
    ),
    hasCapability(capability: AppCapability) {
      return hasExecutionPermission(context, capability);
    },
  };
}

export async function requireHrBenefitsRead() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, "hr.benefits.read");
  return toHrBenefitsExecutionGuard(context);
}

export async function requireHrBenefitsWrite() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, "hr.benefits.write");
  return toHrBenefitsExecutionGuard(context);
}

/** HRM-BEN-027 — sensitive contribution and deduction detail mutations. */
export async function requireHrBenefitsSensitiveWrite() {
  const guard = await requireHrBenefitsWrite();
  if (!guard.canViewSensitive) {
    throw new HrBenefitsSensitiveAccessError();
  }
  return guard;
}
