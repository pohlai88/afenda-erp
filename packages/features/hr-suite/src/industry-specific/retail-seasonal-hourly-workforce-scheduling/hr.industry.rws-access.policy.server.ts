import type { AppCapability } from "@afenda/kernel";
import { resolveEmployeeIdsVisibleToActor } from "@afenda/db";

import {
  requireHrCapability,
  type HrModuleExecutionGuard,
} from "../../hr-suite-integration/server";
import {
  HR_RWS_APPROVE_CAPABILITY,
  HR_RWS_AUDIT_READ_CAPABILITY,
  HR_RWS_INTEGRATION_EXPOSE_CAPABILITY,
  HR_RWS_LABOR_COST_READ_CAPABILITY,
  HR_RWS_READ_CAPABILITY,
  HR_RWS_RESTRICTED_READ_CAPABILITY,
  HR_RWS_WRITE_CAPABILITY,
} from "./hr.industry.rws-constants.shared";

export type HrIndustryRwsAccessScope = "self" | "team" | "org";

export type HrIndustryRwsExecutionGuard = {
  readonly context: HrModuleExecutionGuard["context"];
  readonly organization: { readonly id: string };
  readonly session: { readonly id: string };
  readonly canWrite: boolean;
  readonly canApprove: boolean;
  readonly canReadAudit: boolean;
  readonly canReadRestricted: boolean;
  readonly canReadLaborCost: boolean;
  readonly canExposeIntegrations: boolean;
  hasCapability(capability: AppCapability): boolean;
  resolveVisibleEmployeeIds(input: {
    readonly scope: HrIndustryRwsAccessScope;
    readonly selfEmployeeId?: string | null;
  }): Promise<readonly string[] | null>;
};

function toHrIndustryRwsExecutionGuard(
  moduleGuard: HrModuleExecutionGuard,
): HrIndustryRwsExecutionGuard {
  const { context } = moduleGuard;
  const canRead = moduleGuard.hasCapability(HR_RWS_READ_CAPABILITY);
  const canWrite = moduleGuard.hasCapability(HR_RWS_WRITE_CAPABILITY);
  const canApprove = moduleGuard.hasCapability(HR_RWS_APPROVE_CAPABILITY);
  const isLeadership = context.role === "owner" || context.role === "admin";

  return {
    context,
    organization: { id: context.organizationId },
    session: { id: context.userId },
    canWrite,
    canApprove,
    canReadAudit:
      canRead &&
      (isLeadership || moduleGuard.hasCapability(HR_RWS_AUDIT_READ_CAPABILITY)),
    canReadRestricted:
      canRead &&
      (isLeadership ||
        moduleGuard.hasCapability(HR_RWS_RESTRICTED_READ_CAPABILITY)),
    canReadLaborCost:
      canRead &&
      (isLeadership ||
        moduleGuard.hasCapability(HR_RWS_LABOR_COST_READ_CAPABILITY)),
    canExposeIntegrations:
      canRead &&
      (isLeadership ||
        moduleGuard.hasCapability(HR_RWS_INTEGRATION_EXPOSE_CAPABILITY)),
    hasCapability(capability) {
      return moduleGuard.hasCapability(capability);
    },
    async resolveVisibleEmployeeIds(scopeInput) {
      if (!canRead) return [];

      let scope = scopeInput.scope;
      if (scope === "org" && !canWrite && !canApprove && !isLeadership) {
        scope = "team";
      }
      if (scope === "team" && context.role === "staff") {
        scope = "self";
      }

      return resolveEmployeeIdsVisibleToActor({
        organizationId: context.organizationId,
        actorAuthUserId: context.userId,
        scope,
        selfEmployeeId: scopeInput.selfEmployeeId,
      });
    },
  };
}

export async function requireHrIndustryRwsRead() {
  return toHrIndustryRwsExecutionGuard(
    await requireHrCapability(HR_RWS_READ_CAPABILITY),
  );
}

export async function requireHrIndustryRwsWrite() {
  return toHrIndustryRwsExecutionGuard(
    await requireHrCapability(HR_RWS_WRITE_CAPABILITY),
  );
}

export async function requireHrIndustryRwsApprove() {
  return toHrIndustryRwsExecutionGuard(
    await requireHrCapability(HR_RWS_APPROVE_CAPABILITY),
  );
}
