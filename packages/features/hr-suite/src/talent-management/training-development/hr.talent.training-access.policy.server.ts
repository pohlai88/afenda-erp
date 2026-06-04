import type { AppCapability } from "@afenda/kernel";
import { resolveEmployeeIdsVisibleToActor } from "@afenda/db";

import {
  requireHrCapability,
  type HrModuleExecutionGuard,
} from "../../hr-suite-integration/server";
import {
  HR_TRAINING_APPROVE_CAPABILITY,
  HR_TRAINING_AUDIT_READ_CAPABILITY,
  HR_TRAINING_INTEGRATION_EXPOSE_CAPABILITY,
  HR_TRAINING_READ_CAPABILITY,
  HR_TRAINING_RESTRICTED_READ_CAPABILITY,
  HR_TRAINING_WRITE_CAPABILITY,
} from "./hr.talent.training-constants.shared";

export type HrTrainingAccessScope = "self" | "team" | "org";

export type HrTrainingExecutionGuard = {
  context: HrModuleExecutionGuard["context"];
  organization: { id: string };
  session: { id: string };
  canWrite: boolean;
  canApprove: boolean;
  canReadAudit: boolean;
  canReadRestricted: boolean;
  canExposeIntegrations: boolean;
  hasCapability(capability: AppCapability): boolean;
  resolveVisibleEmployeeIds(input: {
    scope: HrTrainingAccessScope;
    selfEmployeeId?: string | null;
  }): Promise<readonly string[] | null>;
};

function toHrTrainingExecutionGuard(
  moduleGuard: HrModuleExecutionGuard,
): HrTrainingExecutionGuard {
  const { context } = moduleGuard;
  const canRead = moduleGuard.hasCapability(HR_TRAINING_READ_CAPABILITY);
  const canWrite = moduleGuard.hasCapability(HR_TRAINING_WRITE_CAPABILITY);
  const canApprove = moduleGuard.hasCapability(HR_TRAINING_APPROVE_CAPABILITY);
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
        moduleGuard.hasCapability(HR_TRAINING_AUDIT_READ_CAPABILITY)),
    canReadRestricted:
      canRead &&
      (isLeadership ||
        moduleGuard.hasCapability(HR_TRAINING_RESTRICTED_READ_CAPABILITY)),
    canExposeIntegrations:
      canRead &&
      (isLeadership ||
        moduleGuard.hasCapability(HR_TRAINING_INTEGRATION_EXPOSE_CAPABILITY)),
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

export async function requireHrTrainingRead() {
  return toHrTrainingExecutionGuard(
    await requireHrCapability(HR_TRAINING_READ_CAPABILITY),
  );
}

export async function requireHrTrainingWrite() {
  return toHrTrainingExecutionGuard(
    await requireHrCapability(HR_TRAINING_WRITE_CAPABILITY),
  );
}

export async function requireHrTrainingApprove() {
  return toHrTrainingExecutionGuard(
    await requireHrCapability(HR_TRAINING_APPROVE_CAPABILITY),
  );
}

export const requireHrTalentTrainingRead = requireHrTrainingRead;
export const requireHrTalentTrainingWrite = requireHrTrainingWrite;
export const requireHrTalentTrainingApprove = requireHrTrainingApprove;

export {
  HR_TRAINING_APPROVE_CAPABILITY,
  HR_TRAINING_AUDIT_READ_CAPABILITY,
  HR_TRAINING_INTEGRATION_EXPOSE_CAPABILITY,
  HR_TRAINING_READ_CAPABILITY,
  HR_TRAINING_RESTRICTED_READ_CAPABILITY,
  HR_TRAINING_WRITE_CAPABILITY,
};
