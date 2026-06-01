import type { AppCapability } from "@afenda/auth";
import { resolveEmployeeIdsVisibleToActor } from "@afenda/db";

import {
  requireHrCapability,
  type HrModuleExecutionGuard,
} from "../../../hr-suite-integration/server";
import {
  HR_UCB_APPROVE_CAPABILITY,
  HR_UCB_AUDIT_READ_CAPABILITY,
  HR_UCB_GRIEVANCE_MANAGE_CAPABILITY,
  HR_UCB_INTEGRATION_EXPOSE_CAPABILITY,
  HR_UCB_LEGAL_REFERENCE_READ_CAPABILITY,
  HR_UCB_PAYROLL_EXPOSE_CAPABILITY,
  HR_UCB_READ_CAPABILITY,
  HR_UCB_REPORT_EXPORT_CAPABILITY,
  HR_UCB_RESTRICTED_READ_CAPABILITY,
  HR_UCB_WRITE_CAPABILITY,
} from "../schemas/hr.industry.ucb-constants.shared";

export type HrIndustryUcbAccessScope = "self" | "team" | "org";

export type HrIndustryUcbExecutionGuard = {
  readonly context: HrModuleExecutionGuard["context"];
  readonly organization: { readonly id: string };
  readonly session: { readonly id: string };
  readonly canWrite: boolean;
  readonly canApprove: boolean;
  readonly canReadAudit: boolean;
  readonly canReadRestricted: boolean;
  readonly canManageGrievances: boolean;
  readonly canReadLegalReferences: boolean;
  readonly canExposePayroll: boolean;
  readonly canExposeIntegrations: boolean;
  readonly canExportReports: boolean;
  hasCapability(capability: AppCapability): boolean;
  resolveVisibleEmployeeIds(input: {
    readonly scope: HrIndustryUcbAccessScope;
    readonly selfEmployeeId?: string | null;
  }): Promise<readonly string[] | null>;
};

function toHrIndustryUcbExecutionGuard(
  moduleGuard: HrModuleExecutionGuard,
): HrIndustryUcbExecutionGuard {
  const { context } = moduleGuard;
  const canRead = moduleGuard.hasCapability(HR_UCB_READ_CAPABILITY);
  const canWrite = moduleGuard.hasCapability(HR_UCB_WRITE_CAPABILITY);
  const canApprove = moduleGuard.hasCapability(HR_UCB_APPROVE_CAPABILITY);
  const isLeadership = context.role === "owner" || context.role === "admin";

  return {
    context,
    organization: { id: context.organizationId },
    session: { id: context.userId },
    canWrite,
    canApprove,
    canReadAudit:
      canRead &&
      (isLeadership || moduleGuard.hasCapability(HR_UCB_AUDIT_READ_CAPABILITY)),
    canReadRestricted:
      canRead &&
      (isLeadership ||
        moduleGuard.hasCapability(HR_UCB_RESTRICTED_READ_CAPABILITY)),
    canManageGrievances:
      canRead &&
      (isLeadership ||
        canWrite ||
        moduleGuard.hasCapability(HR_UCB_GRIEVANCE_MANAGE_CAPABILITY)),
    canReadLegalReferences:
      canRead &&
      (isLeadership ||
        moduleGuard.hasCapability(HR_UCB_LEGAL_REFERENCE_READ_CAPABILITY)),
    canExposePayroll:
      canRead &&
      (isLeadership ||
        moduleGuard.hasCapability(HR_UCB_PAYROLL_EXPOSE_CAPABILITY)),
    canExposeIntegrations:
      canRead &&
      (isLeadership ||
        moduleGuard.hasCapability(HR_UCB_INTEGRATION_EXPOSE_CAPABILITY)),
    canExportReports:
      canRead &&
      (isLeadership ||
        moduleGuard.hasCapability(HR_UCB_REPORT_EXPORT_CAPABILITY)),
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

export async function requireHrIndustryUcbRead() {
  return toHrIndustryUcbExecutionGuard(
    await requireHrCapability(HR_UCB_READ_CAPABILITY),
  );
}

export async function requireHrIndustryUcbWrite() {
  return toHrIndustryUcbExecutionGuard(
    await requireHrCapability(HR_UCB_WRITE_CAPABILITY),
  );
}

export async function requireHrIndustryUcbApprove() {
  return toHrIndustryUcbExecutionGuard(
    await requireHrCapability(HR_UCB_APPROVE_CAPABILITY),
  );
}
