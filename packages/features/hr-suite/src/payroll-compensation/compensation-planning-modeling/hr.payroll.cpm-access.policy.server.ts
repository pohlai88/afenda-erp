import type { AppCapability } from "@afenda/auth";
import {
  hasExecutionPermission,
  requireExecutionContext,
  requireExecutionPermission,
  type ExecutionContext,
} from "@afenda/kernel/execution";

import {
  HR_CPM_APPROVE_CAPABILITY,
  HR_CPM_READ_CAPABILITY,
  HR_CPM_WRITE_CAPABILITY,
} from "./hr.payroll.cpm-constants.shared";

export type HrCpmExecutionGuard = {
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

function toHrCpmExecutionGuard(context: ExecutionContext): HrCpmExecutionGuard {
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
    canApprove: hasExecutionPermission(context, HR_CPM_APPROVE_CAPABILITY),
    hasCapability(capability: AppCapability) {
      return hasExecutionPermission(context, capability);
    },
  };
}

export async function requireHrCpmRead() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, HR_CPM_READ_CAPABILITY);
  return toHrCpmExecutionGuard(context);
}

export async function requireHrCpmWrite() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, HR_CPM_WRITE_CAPABILITY);
  return toHrCpmExecutionGuard(context);
}

export async function requireHrCpmApprove() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, HR_CPM_APPROVE_CAPABILITY);
  return toHrCpmExecutionGuard(context);
}

export function canHrCpmSubmitRecommendation(guard: HrCpmExecutionGuard): boolean {
  return guard.hasCapability(HR_CPM_WRITE_CAPABILITY);
}

export function canHrCpmReviewRecommendation(guard: HrCpmExecutionGuard): boolean {
  return guard.canApprove;
}

export function canHrCpmFinalizeRecommendation(guard: HrCpmExecutionGuard): boolean {
  return guard.canApprove;
}

export function canHrCpmEditRecommendation(
  guard: HrCpmExecutionGuard,
  status: string,
  lockedAt: Date | null | undefined,
): boolean {
  if (!guard.hasCapability(HR_CPM_WRITE_CAPABILITY)) {
    return false;
  }
  return (
    lockedAt == null &&
    !(["approved"] as readonly string[]).includes(status)
  );
}

export {
  HR_CPM_READ_CAPABILITY,
  HR_CPM_WRITE_CAPABILITY,
  HR_CPM_APPROVE_CAPABILITY,
};
