import type { AppCapability } from "@afenda/auth";
import { resolveEmployeeIdsVisibleToActor } from "@afenda/db";

import {
  requireHrCapability,
  type HrModuleExecutionGuard,
} from "../../employee-management/compliance-regulatory-tracking/server";
import {
  HR_MSC_APPROVE_CAPABILITY,
  HR_MSC_AUDIT_READ_CAPABILITY,
  HR_MSC_INTEGRATION_EXPOSE_CAPABILITY,
  HR_MSC_READ_CAPABILITY,
  HR_MSC_RESTRICTED_READ_CAPABILITY,
  HR_MSC_WRITE_CAPABILITY,
} from "./hr.industry.msc-constants.shared";

export type HrIndustryMscAccessScope = "self" | "team" | "org";

export type HrIndustryMscExecutionGuard = {
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
    readonly scope: HrIndustryMscAccessScope;
    readonly selfEmployeeId?: string | null;
  }): Promise<readonly string[] | null>;
};

function toHrIndustryMscExecutionGuard(
  moduleGuard: HrModuleExecutionGuard,
): HrIndustryMscExecutionGuard {
  const { context } = moduleGuard;
  const canRead = moduleGuard.hasCapability(HR_MSC_READ_CAPABILITY);
  const canWrite = moduleGuard.hasCapability(HR_MSC_WRITE_CAPABILITY);
  const canApprove = moduleGuard.hasCapability(HR_MSC_APPROVE_CAPABILITY);
  const isLeadership = context.role === "owner" || context.role === "admin";

  return {
    context,
    organization: { id: context.organizationId },
    session: { id: context.userId },
    canWrite,
    canApprove,
    canReadAudit:
      canRead &&
      (isLeadership || moduleGuard.hasCapability(HR_MSC_AUDIT_READ_CAPABILITY)),
    canReadRestricted:
      canRead &&
      (isLeadership ||
        moduleGuard.hasCapability(HR_MSC_RESTRICTED_READ_CAPABILITY)),
    canExposeIntegrations:
      canRead &&
      (isLeadership ||
        moduleGuard.hasCapability(HR_MSC_INTEGRATION_EXPOSE_CAPABILITY)),
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

export async function requireHrIndustryMscRead() {
  return toHrIndustryMscExecutionGuard(
    await requireHrCapability(HR_MSC_READ_CAPABILITY),
  );
}

export async function requireHrIndustryMscWrite() {
  return toHrIndustryMscExecutionGuard(
    await requireHrCapability(HR_MSC_WRITE_CAPABILITY),
  );
}

export async function requireHrIndustryMscApprove() {
  return toHrIndustryMscExecutionGuard(
    await requireHrCapability(HR_MSC_APPROVE_CAPABILITY),
  );
}
