import type { AppCapability } from "@afenda/auth";

import {
  requireHrCapability,
  type HrModuleExecutionGuard,
} from "../../../hr-suite-integration/server";
import {
  HR_TALENT_ENG_APPROVE_CAPABILITY,
  HR_TALENT_ENG_AUDIT_READ_CAPABILITY,
  HR_TALENT_ENG_INTEGRATION_EXPOSE_CAPABILITY,
  HR_TALENT_ENG_READ_CAPABILITY,
  HR_TALENT_ENG_RESTRICTED_READ_CAPABILITY,
  HR_TALENT_ENG_WRITE_CAPABILITY,
} from "../schemas/hr.talent.eng-constants.shared";

export type HrTalentEngExecutionGuard = {
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

function toHrTalentEngExecutionGuard(
  moduleGuard: HrModuleExecutionGuard,
): HrTalentEngExecutionGuard {
  const { context } = moduleGuard;
  const canRead = moduleGuard.hasCapability(HR_TALENT_ENG_READ_CAPABILITY);
  const canWrite = moduleGuard.hasCapability(HR_TALENT_ENG_WRITE_CAPABILITY);
  const canApprove = moduleGuard.hasCapability(
    HR_TALENT_ENG_APPROVE_CAPABILITY,
  );
  const isLeadership = context.role === "owner" || context.role === "admin";

  return {
    context,
    organization: { id: context.organizationId },
    session: { id: context.userId },
    canWrite,
    canApprove,
    canReadAudit:
      canRead &&
      (isLeadership ||
        moduleGuard.hasCapability(HR_TALENT_ENG_AUDIT_READ_CAPABILITY)),
    canReadRestricted:
      canRead &&
      (isLeadership ||
        moduleGuard.hasCapability(HR_TALENT_ENG_RESTRICTED_READ_CAPABILITY)),
    canExposeIntegrations:
      canRead &&
      (isLeadership ||
        moduleGuard.hasCapability(
          HR_TALENT_ENG_INTEGRATION_EXPOSE_CAPABILITY,
        )),
    hasCapability(capability) {
      return moduleGuard.hasCapability(capability);
    },
    async resolveVisibleEmployeeIds(input) {
      if (!canRead) {
        return [];
      }
      if (isLeadership || canWrite || canApprove) {
        return input?.managedEmployeeIds?.length
          ? input.managedEmployeeIds
          : null;
      }
      if (input?.selfEmployeeId) {
        return [input.selfEmployeeId];
      }
      return [context.userId];
    },
  };
}

export async function requireHrTalentEngRead() {
  return toHrTalentEngExecutionGuard(
    await requireHrCapability(HR_TALENT_ENG_READ_CAPABILITY),
  );
}

export async function requireHrTalentEngWrite() {
  return toHrTalentEngExecutionGuard(
    await requireHrCapability(HR_TALENT_ENG_WRITE_CAPABILITY),
  );
}

export async function requireHrTalentEngApprove() {
  return toHrTalentEngExecutionGuard(
    await requireHrCapability(HR_TALENT_ENG_APPROVE_CAPABILITY),
  );
}
