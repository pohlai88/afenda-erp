import type { AppCapability } from "@afenda/kernel";
import { resolveEmployeeIdsVisibleToActor } from "@afenda/db";

import {
  requireHrCapability,
  type HrModuleExecutionGuard,
} from "../../hr-suite-integration/server";
import {
  HR_FRM_APPROVE_CAPABILITY,
  HR_FRM_AUDIT_READ_CAPABILITY,
  HR_FRM_INTEGRATION_EXPOSE_CAPABILITY,
  HR_FRM_READ_CAPABILITY,
  HR_FRM_RESTRICTED_READ_CAPABILITY,
  HR_FRM_WRITE_CAPABILITY,
} from "./hr.industry.frm-constants.shared";

export type HrIndustryFrmAccessScope = "self" | "team" | "org";

export type HrIndustryFrmExecutionGuard = {
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
    readonly scope: HrIndustryFrmAccessScope;
    readonly selfEmployeeId?: string | null;
  }): Promise<readonly string[] | null>;
};

function toHrIndustryFrmExecutionGuard(
  moduleGuard: HrModuleExecutionGuard,
): HrIndustryFrmExecutionGuard {
  const { context } = moduleGuard;
  const canRead = moduleGuard.hasCapability(HR_FRM_READ_CAPABILITY);
  const canWrite = moduleGuard.hasCapability(HR_FRM_WRITE_CAPABILITY);
  const canApprove = moduleGuard.hasCapability(HR_FRM_APPROVE_CAPABILITY);
  const isLeadership = context.role === "owner" || context.role === "admin";

  return {
    context,
    organization: { id: context.organizationId },
    session: { id: context.userId },
    canWrite,
    canApprove,
    canReadAudit:
      canRead &&
      (isLeadership || moduleGuard.hasCapability(HR_FRM_AUDIT_READ_CAPABILITY)),
    canReadRestricted:
      canRead &&
      (isLeadership ||
        moduleGuard.hasCapability(HR_FRM_RESTRICTED_READ_CAPABILITY)),
    canExposeIntegrations:
      canRead &&
      (isLeadership ||
        moduleGuard.hasCapability(HR_FRM_INTEGRATION_EXPOSE_CAPABILITY)),
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

export async function requireHrIndustryFrmRead() {
  return toHrIndustryFrmExecutionGuard(
    await requireHrCapability(HR_FRM_READ_CAPABILITY),
  );
}

export async function requireHrIndustryFrmWrite() {
  return toHrIndustryFrmExecutionGuard(
    await requireHrCapability(HR_FRM_WRITE_CAPABILITY),
  );
}

export async function requireHrIndustryFrmApprove() {
  return toHrIndustryFrmExecutionGuard(
    await requireHrCapability(HR_FRM_APPROVE_CAPABILITY),
  );
}
