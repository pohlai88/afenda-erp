import type { AppCapability } from "@afenda/auth";
import {
  hasExecutionPermission,
  requireExecutionContext,
  requireExecutionPermission,
  type ExecutionContext,
} from "@afenda/kernel/execution";

import {
  HR_MCP_AUDIT_READ_CAPABILITY,
  HR_MCP_READ_CAPABILITY,
  HR_MCP_STATUTORY_ADMIN_CAPABILITY,
} from "../schemas/hr.payroll.mcp-constants.shared";

export class HrMcpStatutoryAccessError extends Error {
  constructor(message = "Statutory payroll rule modification requires hr.mcp.statutory.admin.") {
    super(message);
    this.name = "HrMcpStatutoryAccessError";
  }
}

export class HrMcpAuditAccessError extends Error {
  constructor(message = "Country payroll audit trail requires hr.mcp.audit.read.") {
    super(message);
    this.name = "HrMcpAuditAccessError";
  }
}

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
  canModifyStatutoryRules: boolean;
  canViewAudit: boolean;
  hasCapability(capability: AppCapability): boolean;
};

function toHrMcpExecutionGuard(context: ExecutionContext): HrMcpExecutionGuard {
  const canModifyStatutoryRules = hasExecutionPermission(
    context,
    HR_MCP_STATUTORY_ADMIN_CAPABILITY,
  );
  const canViewAudit =
    hasExecutionPermission(context, HR_MCP_AUDIT_READ_CAPABILITY) ||
    canModifyStatutoryRules;

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
    canModifyStatutoryRules,
    canViewAudit,
    hasCapability(capability: AppCapability) {
      return hasExecutionPermission(context, capability);
    },
  };
}

/** MCP-001..028 — read country payroll configuration and reports. */
export async function requireHrMcpRead() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, HR_MCP_READ_CAPABILITY);
  return toHrMcpExecutionGuard(context);
}

/** MCP-025 — modify country statutory payroll rules. */
export async function requireHrMcpStatutoryAdmin() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, HR_MCP_READ_CAPABILITY);
  requireExecutionPermission(context, HR_MCP_STATUTORY_ADMIN_CAPABILITY);
  return toHrMcpExecutionGuard(context);
}

/** MCP-028 — read country payroll audit trail. */
export async function requireHrMcpAuditRead() {
  const guard = await requireHrMcpRead();
  if (!guard.canViewAudit) {
    throw new HrMcpAuditAccessError();
  }
  return guard;
}

export function assertHrMcpStatutoryRuleModificationAllowed(
  guard: HrMcpExecutionGuard,
): void {
  if (!guard.canModifyStatutoryRules) {
    throw new HrMcpStatutoryAccessError();
  }
}

export function canHrMcpModifyStatutoryRules(guard: HrMcpExecutionGuard): boolean {
  return guard.canModifyStatutoryRules;
}

export {
  HR_MCP_READ_CAPABILITY,
  HR_MCP_STATUTORY_ADMIN_CAPABILITY,
  HR_MCP_AUDIT_READ_CAPABILITY,
};
