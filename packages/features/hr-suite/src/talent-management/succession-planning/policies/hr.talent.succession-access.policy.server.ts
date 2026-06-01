import type { AppCapability } from "@afenda/auth";
import { resolveEmployeeIdsVisibleToActor } from "@afenda/db";

import {
  requireHrCapability,
  type HrModuleExecutionGuard,
} from "../../../hr-suite-integration/server";
import {
  HR_SUCCESSION_APPROVE_CAPABILITY,
  HR_SUCCESSION_AUDIT_READ_CAPABILITY,
  HR_SUCCESSION_LIFECYCLE_EXPOSE_CAPABILITY,
  HR_SUCCESSION_READ_CAPABILITY,
  HR_SUCCESSION_RESTRICTED_READ_CAPABILITY,
  HR_SUCCESSION_WRITE_CAPABILITY,
} from "../schemas/hr.talent.succession-constants.shared";

export type HrSuccessionAccessScope = "self" | "team" | "org";

export type HrSuccessionExecutionGuard = {
  context: HrModuleExecutionGuard["context"];
  organization: { id: string };
  session: { id: string };
  canWrite: boolean;
  canReview: boolean;
  canApprove: boolean;
  canReadAudit: boolean;
  canReadRestricted: boolean;
  canExposeLifecycle: boolean;
  hasCapability(capability: AppCapability): boolean;
  resolveVisibleEmployeeIds(input: {
    scope: HrSuccessionAccessScope;
    selfEmployeeId?: string | null;
  }): Promise<readonly string[] | null>;
};

function toHrSuccessionExecutionGuard(
  moduleGuard: HrModuleExecutionGuard,
): HrSuccessionExecutionGuard {
  const { context } = moduleGuard;
  const canRead = moduleGuard.hasCapability(HR_SUCCESSION_READ_CAPABILITY);
  const canWrite = moduleGuard.hasCapability(HR_SUCCESSION_WRITE_CAPABILITY);
  const canApprove = moduleGuard.hasCapability(
    HR_SUCCESSION_APPROVE_CAPABILITY,
  );
  const isLeadership = context.role === "owner" || context.role === "admin";

  return {
    context,
    organization: { id: context.organizationId },
    session: { id: context.userId },
    canWrite,
    canReview: canWrite || canApprove || isLeadership,
    canApprove,
    canReadAudit:
      canRead &&
      (isLeadership ||
        moduleGuard.hasCapability(HR_SUCCESSION_AUDIT_READ_CAPABILITY)),
    canReadRestricted:
      canRead &&
      (isLeadership ||
        moduleGuard.hasCapability(HR_SUCCESSION_RESTRICTED_READ_CAPABILITY)),
    canExposeLifecycle:
      canRead &&
      (isLeadership ||
        moduleGuard.hasCapability(HR_SUCCESSION_LIFECYCLE_EXPOSE_CAPABILITY)),
    hasCapability(capability) {
      return moduleGuard.hasCapability(capability);
    },
    async resolveVisibleEmployeeIds(scopeInput) {
      if (!canRead) {
        return [];
      }
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

export async function requireHrSuccessionRead() {
  return toHrSuccessionExecutionGuard(
    await requireHrCapability(HR_SUCCESSION_READ_CAPABILITY),
  );
}

export const requireHrSuccessionPlanningRead = requireHrSuccessionRead;

export async function requireHrSuccessionWrite() {
  return toHrSuccessionExecutionGuard(
    await requireHrCapability(HR_SUCCESSION_WRITE_CAPABILITY),
  );
}

export async function requireHrSuccessionApprove() {
  return toHrSuccessionExecutionGuard(
    await requireHrCapability(HR_SUCCESSION_APPROVE_CAPABILITY),
  );
}

export function canHrSuccessionExposeLifecycle(
  guard: HrSuccessionExecutionGuard,
) {
  return guard.canExposeLifecycle;
}

export {
  HR_SUCCESSION_APPROVE_CAPABILITY,
  HR_SUCCESSION_AUDIT_READ_CAPABILITY,
  HR_SUCCESSION_LIFECYCLE_EXPOSE_CAPABILITY,
  HR_SUCCESSION_READ_CAPABILITY,
  HR_SUCCESSION_RESTRICTED_READ_CAPABILITY,
  HR_SUCCESSION_WRITE_CAPABILITY,
};
