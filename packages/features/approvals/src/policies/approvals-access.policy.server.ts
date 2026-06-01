import type { AppCapability } from "@afenda/auth";
import {
  hasExecutionPermission,
  requireExecutionContext,
  requireExecutionPermission,
  type ExecutionContext,
} from "@afenda/kernel/execution";

import {
  APPROVALS_DECIDE_CAPABILITY,
  APPROVALS_VIEW_CAPABILITY,
} from "../schemas/approvals.capability.shared";

export type ApprovalsExecutionGuard = {
  context: ExecutionContext;
  session: { id: string };
  organization: {
    id: string;
    slug: string;
    locale: string;
    role: ExecutionContext["role"];
    capabilities: readonly AppCapability[];
  };
  canDecide: boolean;
  hasCapability(capability: AppCapability): boolean;
};

function toApprovalsExecutionGuard(
  context: ExecutionContext,
): ApprovalsExecutionGuard {
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
    canDecide: hasExecutionPermission(context, APPROVALS_DECIDE_CAPABILITY),
    hasCapability(capability: AppCapability) {
      return hasExecutionPermission(context, capability);
    },
  };
}

export async function requireApprovalsView() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, APPROVALS_VIEW_CAPABILITY);
  return toApprovalsExecutionGuard(context);
}

export async function requireApprovalsDecide() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, APPROVALS_DECIDE_CAPABILITY);
  return toApprovalsExecutionGuard(context);
}
