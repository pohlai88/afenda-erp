import type { AppCapability } from "@afenda/kernel";
import {
  hasExecutionPermission,
  requireExecutionContext,
  requireExecutionPermission,
  type ExecutionContext,
} from "@afenda/kernel/execution";

import {
  HR_PAYROLL_APPROVE_CAPABILITY,
  HR_PAYROLL_AUDIT_READ_CAPABILITY,
  HR_PAYROLL_ESS_READ_CAPABILITY,
  HR_PAYROLL_READ_CAPABILITY,
  HR_PAYROLL_WRITE_CAPABILITY,
} from "./hr.payroll.processing-constants.shared";

export type HrPayrollProcessingExecutionGuard = {
  context: ExecutionContext;
  session: { id: string };
  organization: {
    id: string;
    slug: string;
    locale: string;
    role: ExecutionContext["role"];
    capabilities: readonly AppCapability[];
  };
  canApprove: boolean;
  hasCapability(capability: AppCapability): boolean;
};

function toGuard(context: ExecutionContext): HrPayrollProcessingExecutionGuard {
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
    canApprove: hasExecutionPermission(context, HR_PAYROLL_APPROVE_CAPABILITY),
    hasCapability(capability: AppCapability) {
      return hasExecutionPermission(context, capability);
    },
  };
}

export async function requireHrPayrollRead() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, HR_PAYROLL_READ_CAPABILITY);
  return toGuard(context);
}

export async function requireHrPayrollWrite() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, HR_PAYROLL_WRITE_CAPABILITY);
  return toGuard(context);
}

export async function requireHrPayrollApprove() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, HR_PAYROLL_APPROVE_CAPABILITY);
  return toGuard(context);
}

export async function requireHrPayrollAuditRead() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, HR_PAYROLL_AUDIT_READ_CAPABILITY);
  return toGuard(context);
}

export async function requireHrPayrollEssRead() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, HR_PAYROLL_ESS_READ_CAPABILITY);
  return toGuard(context);
}

export function canHrPayrollApproveRun(guard: HrPayrollProcessingExecutionGuard): boolean {
  return guard.canApprove;
}

export function canHrPayrollEditRun(
  guard: HrPayrollProcessingExecutionGuard,
  status: string,
  lockedAt: Date | null | undefined,
): boolean {
  if (!guard.hasCapability(HR_PAYROLL_WRITE_CAPABILITY)) {
    return false;
  }
  return (
    lockedAt == null &&
    !(["locked", "closed", "cancelled"] as readonly string[]).includes(status)
  );
}

export {
  HR_PAYROLL_READ_CAPABILITY,
  HR_PAYROLL_WRITE_CAPABILITY,
  HR_PAYROLL_APPROVE_CAPABILITY,
  HR_PAYROLL_AUDIT_READ_CAPABILITY,
  HR_PAYROLL_ESS_READ_CAPABILITY,
};
