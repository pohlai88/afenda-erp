import type { AppCapability } from "@afenda/kernel";
import {
  hasExecutionPermission,
  requireExecutionContext,
  requireExecutionPermission,
  type ExecutionContext,
} from "@afenda/kernel/execution";

import {
  HR_SBS_APPROVE_CAPABILITY,
  HR_SBS_READ_CAPABILITY,
  HR_SBS_WRITE_CAPABILITY,
} from "./hr.payroll.sbs-constants.shared";

export type HrSbsExecutionGuard = {
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

function toHrSbsExecutionGuard(context: ExecutionContext): HrSbsExecutionGuard {
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
    canApprove: hasExecutionPermission(context, HR_SBS_APPROVE_CAPABILITY),
    hasCapability(capability: AppCapability) {
      return hasExecutionPermission(context, capability);
    },
  };
}

export async function requireHrSbsRead() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, HR_SBS_READ_CAPABILITY);
  return toHrSbsExecutionGuard(context);
}

export async function requireHrSbsWrite() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, HR_SBS_WRITE_CAPABILITY);
  return toHrSbsExecutionGuard(context);
}

export async function requireHrSbsApprove() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, HR_SBS_APPROVE_CAPABILITY);
  return toHrSbsExecutionGuard(context);
}

export function canHrSbsReviewMapping(guard: HrSbsExecutionGuard): boolean {
  return guard.canApprove;
}

export {
  HR_SBS_READ_CAPABILITY,
  HR_SBS_WRITE_CAPABILITY,
  HR_SBS_APPROVE_CAPABILITY,
};
