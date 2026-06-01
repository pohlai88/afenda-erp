import type { AppCapability } from "@afenda/auth";
import { resolveEmployeeIdsVisibleToActor } from "@afenda/db";

import {
  requireHrCapability,
  type HrModuleExecutionGuard,
} from "../../../hr-suite-integration/server";
import {
  HR_FHC_APPROVE_CAPABILITY,
  HR_FHC_AUDIT_READ_CAPABILITY,
  HR_FHC_INTEGRATION_EXPOSE_CAPABILITY,
  HR_FHC_READ_CAPABILITY,
  HR_FHC_RESTRICTED_READ_CAPABILITY,
  HR_FHC_WRITE_CAPABILITY,
} from "../schemas/hr.industry.fhc-constants.shared";

export type HrIndustryFhcAccessScope = "self" | "team" | "org";

export type HrIndustryFhcExecutionGuard = {
  readonly context: HrModuleExecutionGuard["context"];
  readonly organization: { readonly id: string };
  readonly session: { readonly id: string };
  readonly canWrite: boolean;
  readonly canApprove: boolean;
  readonly canReadAudit: boolean;
  readonly canReadRestricted: boolean;
  readonly canExposeIntegrations: boolean;
  hasCapability(capability: AppCapability): boolean;
  resolveVisibleEmployeeIds(input: {
    readonly scope: HrIndustryFhcAccessScope;
    readonly selfEmployeeId?: string | null;
  }): Promise<readonly string[] | null>;
};

function toHrIndustryFhcExecutionGuard(
  moduleGuard: HrModuleExecutionGuard,
): HrIndustryFhcExecutionGuard {
  const { context } = moduleGuard;
  const canRead = moduleGuard.hasCapability(HR_FHC_READ_CAPABILITY);
  const canWrite = moduleGuard.hasCapability(HR_FHC_WRITE_CAPABILITY);
  const canApprove = moduleGuard.hasCapability(HR_FHC_APPROVE_CAPABILITY);
  const isLeadership = context.role === "owner" || context.role === "admin";

  return {
    context,
    organization: { id: context.organizationId },
    session: { id: context.userId },
    canWrite,
    canApprove,
    canReadAudit:
      canRead &&
      (isLeadership || moduleGuard.hasCapability(HR_FHC_AUDIT_READ_CAPABILITY)),
    canReadRestricted:
      canRead &&
      (isLeadership ||
        moduleGuard.hasCapability(HR_FHC_RESTRICTED_READ_CAPABILITY)),
    canExposeIntegrations:
      canRead &&
      (isLeadership ||
        moduleGuard.hasCapability(HR_FHC_INTEGRATION_EXPOSE_CAPABILITY)),
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

export async function requireHrIndustryFhcRead() {
  return toHrIndustryFhcExecutionGuard(
    await requireHrCapability(HR_FHC_READ_CAPABILITY),
  );
}

export async function requireHrIndustryFhcWrite() {
  return toHrIndustryFhcExecutionGuard(
    await requireHrCapability(HR_FHC_WRITE_CAPABILITY),
  );
}

export async function requireHrIndustryFhcApprove() {
  return toHrIndustryFhcExecutionGuard(
    await requireHrCapability(HR_FHC_APPROVE_CAPABILITY),
  );
}
