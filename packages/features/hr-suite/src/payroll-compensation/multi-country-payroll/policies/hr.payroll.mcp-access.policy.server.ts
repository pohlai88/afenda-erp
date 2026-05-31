import type { AppCapability } from "@afenda/auth";
import {
  hasExecutionPermission,
  requireExecutionContext,
  requireExecutionPermission,
  type ExecutionContext,
} from "@afenda/kernel/execution";

import {
  HR_MCP_ADMIN_CAPABILITY,
  HR_MCP_AUDIT_READ_CAPABILITY,
  HR_MCP_LOCKED_RULE_VERSION_STATUSES,
  HR_MCP_READ_CAPABILITY,
  HR_MCP_WRITE_CAPABILITY,
} from "../schemas/hr.payroll.mcp-constants.shared";

export type HrMcpExecutionGuard = {
  context: ExecutionContext;
  session: { id: string };
  organization: {
    id: string;
    slug: string;
    locale: string;
    role: ExecutionContext["role"];
    capabilities: readonly AppCapability[];
  };
  canAdministerRules: boolean;
  canViewAudit: boolean;
  hasCapability(capability: AppCapability): boolean;
};

function toHrMcpExecutionGuard(context: ExecutionContext): HrMcpExecutionGuard {
  const canAdministerRules = hasExecutionPermission(
    context,
    HR_MCP_ADMIN_CAPABILITY,
  );
  const canViewAudit =
    hasExecutionPermission(context, HR_MCP_AUDIT_READ_CAPABILITY) ||
    hasExecutionPermission(context, HR_MCP_WRITE_CAPABILITY);

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
    canAdministerRules,
    canViewAudit,
    hasCapability(capability: AppCapability) {
      return hasExecutionPermission(context, capability);
    },
  };
}

/** MCP-025 — read country payroll configuration and derived views. */
export async function requireHrMcpRead() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, HR_MCP_READ_CAPABILITY);
  return toHrMcpExecutionGuard(context);
}

/** MCP-001..014 — create or update country payroll setup records. */
export async function requireHrMcpWrite() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, HR_MCP_WRITE_CAPABILITY);
  return toHrMcpExecutionGuard(context);
}

/** MCP-025 — modify statutory payroll rules and publish rule versions. */
export async function requireHrMcpAdmin() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, HR_MCP_READ_CAPABILITY);
  requireExecutionPermission(context, HR_MCP_ADMIN_CAPABILITY);
  return toHrMcpExecutionGuard(context);
}

export async function requireHrMcpAuditRead() {
  const guard = await requireHrMcpRead();
  if (!guard.canViewAudit) {
    throw new Error("hr.mcp.audit.read capability required");
  }
  return guard;
}

export function canHrMcpEditCountrySetup(guard: HrMcpExecutionGuard): boolean {
  return guard.hasCapability(HR_MCP_WRITE_CAPABILITY);
}

export function canHrMcpEditStatutoryRules(guard: HrMcpExecutionGuard): boolean {
  return guard.canAdministerRules;
}

export function canHrMcpPublishRuleVersion(guard: HrMcpExecutionGuard): boolean {
  return guard.canAdministerRules;
}

export function canHrMcpEditRuleVersion(
  guard: HrMcpExecutionGuard,
  versionStatus: string,
): boolean {
  if (!guard.canAdministerRules) {
    return false;
  }
  return !(HR_MCP_LOCKED_RULE_VERSION_STATUSES as readonly string[]).includes(
    versionStatus,
  );
}

export {
  HR_MCP_ADMIN_CAPABILITY,
  HR_MCP_AUDIT_READ_CAPABILITY,
  HR_MCP_READ_CAPABILITY,
  HR_MCP_WRITE_CAPABILITY,
};
