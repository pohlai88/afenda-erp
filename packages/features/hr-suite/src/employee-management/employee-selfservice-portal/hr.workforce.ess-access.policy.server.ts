import type { AppCapability } from "@afenda/kernel";

import {
  requireHrCapability,
  type HrModuleExecutionGuard,
} from "../../hr-suite-integration/server";
import {
  HR_WORKFORCE_ESS_APPROVE_CAPABILITY,
  HR_WORKFORCE_ESS_AUDIT_READ_CAPABILITY,
  HR_WORKFORCE_ESS_INTEGRATION_EXPOSE_CAPABILITY,
  HR_WORKFORCE_ESS_READ_CAPABILITY,
  HR_WORKFORCE_ESS_RESTRICTED_READ_CAPABILITY,
  HR_WORKFORCE_ESS_WRITE_CAPABILITY,
} from "./hr.workforce.ess-constants.shared";

export type HrWorkforceEssExecutionGuard = {
  readonly context: HrModuleExecutionGuard["context"];
  readonly organization: { readonly id: string };
  readonly session: { readonly id: string };
  readonly canWrite: boolean;
  readonly canApprove: boolean;
  readonly canReadAudit: boolean;
  readonly canReadRestricted: boolean;
  readonly canExposeIntegrations: boolean;
  hasCapability(capability: AppCapability): boolean;
  resolveVisibleEmployeeIds(input?: {
    readonly selfEmployeeId?: string | null;
    readonly managedEmployeeIds?: readonly string[] | null;
  }): Promise<readonly string[] | null>;
};

function toHrWorkforceEssExecutionGuard(
  moduleGuard: HrModuleExecutionGuard,
): HrWorkforceEssExecutionGuard {
  const { context } = moduleGuard;
  const canRead = moduleGuard.hasCapability(HR_WORKFORCE_ESS_READ_CAPABILITY);
  const canWrite = moduleGuard.hasCapability(HR_WORKFORCE_ESS_WRITE_CAPABILITY);
  const canApprove = moduleGuard.hasCapability(
    HR_WORKFORCE_ESS_APPROVE_CAPABILITY,
  );
  const isLeadership = context.role === "owner" || context.role === "admin";
  const canReadRestricted =
    canRead &&
    (isLeadership ||
      moduleGuard.hasCapability(HR_WORKFORCE_ESS_RESTRICTED_READ_CAPABILITY));
  const canReadOrganizationScope = isLeadership || canReadRestricted;
  const hasPortalAccess = canRead || canWrite || canApprove;

  return {
    context,
    organization: { id: context.organizationId },
    session: { id: context.userId },
    canWrite,
    canApprove,
    canReadAudit:
      canRead &&
      (isLeadership ||
        moduleGuard.hasCapability(HR_WORKFORCE_ESS_AUDIT_READ_CAPABILITY)),
    canReadRestricted:
      canReadRestricted,
    canExposeIntegrations:
      canRead &&
      (isLeadership ||
        moduleGuard.hasCapability(
          HR_WORKFORCE_ESS_INTEGRATION_EXPOSE_CAPABILITY,
        )),
    hasCapability(capability) {
      return moduleGuard.hasCapability(capability);
    },
    async resolveVisibleEmployeeIds(input) {
      if (!hasPortalAccess) {
        return [];
      }
      if (canReadOrganizationScope) {
        return input?.managedEmployeeIds?.length
          ? input.managedEmployeeIds
          : null;
      }
      if (canApprove && input?.managedEmployeeIds?.length) {
        return input.managedEmployeeIds;
      }
      if (input?.selfEmployeeId) {
        return [input.selfEmployeeId];
      }
      return [context.userId];
    },
  };
}

export async function requireHrWorkforceEssRead() {
  return toHrWorkforceEssExecutionGuard(
    await requireHrCapability(HR_WORKFORCE_ESS_READ_CAPABILITY),
  );
}

export async function requireHrWorkforceEssWrite() {
  return toHrWorkforceEssExecutionGuard(
    await requireHrCapability(HR_WORKFORCE_ESS_WRITE_CAPABILITY),
  );
}

export async function requireHrWorkforceEssApprove() {
  return toHrWorkforceEssExecutionGuard(
    await requireHrCapability(HR_WORKFORCE_ESS_APPROVE_CAPABILITY),
  );
}
