import {
  hasExecutionPermission,
  requireExecutionContext,
  requireExecutionPermission,
  type ExecutionContext,
} from "@afenda/kernel/execution";

import {
  hasSystemAdminAnyCapability,
  toSystemAdminExecutionGuard,
  type SystemAdminExecutionGuard,
} from "../../overview/policies/system-admin.capability.policy.server";
import {
  SYSTEM_ADMIN_APPROVALS_DECIDE_CAPABILITY,
  SYSTEM_ADMIN_APPROVALS_VIEW_CAPABILITY,
} from "../schemas/system-admin.approvals-queue-capability.shared";

export function hasSystemAdminApprovalsRulesRead(context: ExecutionContext) {
  return hasSystemAdminAnyCapability(context, [
    "system-admin.approvals.read",
    "system-admin.approvals.review",
    "system-admin.settings.read",
  ]);
}

export function hasSystemAdminApprovalsQueueView(context: ExecutionContext) {
  return hasExecutionPermission(context, SYSTEM_ADMIN_APPROVALS_VIEW_CAPABILITY);
}

export async function requireSystemAdminApprovalsPageAccess(): Promise<SystemAdminExecutionGuard> {
  const context = await requireExecutionContext();

  if (
    hasSystemAdminApprovalsQueueView(context) ||
    hasSystemAdminApprovalsRulesRead(context)
  ) {
    return toSystemAdminExecutionGuard(context);
  }

  requireExecutionPermission(context, "system-admin.approvals.read");
  return toSystemAdminExecutionGuard(context);
}

export async function requireSystemAdminApprovalsQueueDecide(): Promise<SystemAdminExecutionGuard> {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, SYSTEM_ADMIN_APPROVALS_DECIDE_CAPABILITY);
  return toSystemAdminExecutionGuard(context);
}
