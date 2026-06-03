import type { AppCapability } from "@afenda/auth";
import { resolveEmployeeIdsVisibleToActor } from "@afenda/db";

import {
  requireHrCapability,
  type HrModuleExecutionGuard,
} from "../../employee-management/compliance-regulatory-tracking/server";
import {
  HR_PER_APPROVE_CAPABILITY,
  HR_PER_AUDIT_READ_CAPABILITY,
  HR_PER_CALIBRATE_CAPABILITY,
  HR_PER_COMPENSATION_READ_CAPABILITY,
  HR_PER_READ_CAPABILITY,
  HR_PER_WRITE_CAPABILITY,
} from "./hr.talent.performance-constants.shared";
import {
  isPerformanceReviewLocked,
  type HrPerformanceReviewRecord,
} from "./hr.talent.performance-store.shared";

export type HrPerformanceAccessScope = "self" | "team" | "org";

export type HrPerformanceExecutionGuard = {
  context: HrModuleExecutionGuard["context"];
  organization: { id: string };
  canWritePerformance: boolean;
  canApprovePerformance: boolean;
  canCalibratePerformance: boolean;
  canReadAudit: boolean;
  canReadCompensationOutcome: boolean;
  hasCapability(capability: AppCapability): boolean;
  resolveVisibleEmployeeIds(input: {
    scope: HrPerformanceAccessScope;
    selfEmployeeId?: string | null;
  }): Promise<readonly string[] | null>;
};

function toHrPerformanceExecutionGuard(
  moduleGuard: HrModuleExecutionGuard,
): HrPerformanceExecutionGuard {
  const { context } = moduleGuard;
  const canReadPerformance = moduleGuard.hasCapability(HR_PER_READ_CAPABILITY);
  const canWritePerformance = moduleGuard.hasCapability(
    HR_PER_WRITE_CAPABILITY,
  );
  const canApprovePerformance = moduleGuard.hasCapability(
    HR_PER_APPROVE_CAPABILITY,
  );
  const canCalibratePerformance = moduleGuard.hasCapability(
    HR_PER_CALIBRATE_CAPABILITY,
  );
  const canReadAudit = moduleGuard.hasCapability(HR_PER_AUDIT_READ_CAPABILITY);
  const canReadCompensationOutcome = moduleGuard.hasCapability(
    HR_PER_COMPENSATION_READ_CAPABILITY,
  );
  const isLeadership = context.role === "owner" || context.role === "admin";

  return {
    context,
    organization: { id: context.organizationId },
    canWritePerformance,
    canApprovePerformance,
    canCalibratePerformance,
    canReadAudit: canReadPerformance && (canReadAudit || isLeadership),
    canReadCompensationOutcome:
      canReadPerformance && (canReadCompensationOutcome || isLeadership),
    hasCapability(capability) {
      return moduleGuard.hasCapability(capability);
    },
    async resolveVisibleEmployeeIds(scopeInput) {
      if (!canReadPerformance) {
        return [];
      }

      let scope = scopeInput.scope;
      if (scope === "org" && !canWritePerformance && !isLeadership) {
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

export async function requireHrPerformanceRead() {
  return toHrPerformanceExecutionGuard(
    await requireHrCapability(HR_PER_READ_CAPABILITY),
  );
}

export async function requireHrPerformanceWrite() {
  return toHrPerformanceExecutionGuard(
    await requireHrCapability(HR_PER_WRITE_CAPABILITY),
  );
}

export async function requireHrPerformanceApprove() {
  return toHrPerformanceExecutionGuard(
    await requireHrCapability(HR_PER_APPROVE_CAPABILITY),
  );
}

export function canHrPerformanceEditReview(
  guard: HrPerformanceExecutionGuard,
  review: Pick<HrPerformanceReviewRecord, "status" | "lockedAt">,
) {
  return guard.canWritePerformance && !isPerformanceReviewLocked(review);
}

export function canHrPerformanceSubmitReview(
  guard: HrPerformanceExecutionGuard,
) {
  return guard.canWritePerformance;
}

export function canHrPerformanceFinalizeReview(
  guard: HrPerformanceExecutionGuard,
) {
  return guard.canApprovePerformance;
}

export function canHrPerformanceRecordCalibration(
  guard: HrPerformanceExecutionGuard,
) {
  return guard.canCalibratePerformance || guard.canApprovePerformance;
}

export function canHrPerformanceExposeOutcome(
  guard: HrPerformanceExecutionGuard,
) {
  return guard.canReadCompensationOutcome;
}

export {
  HR_PER_APPROVE_CAPABILITY,
  HR_PER_AUDIT_READ_CAPABILITY,
  HR_PER_CALIBRATE_CAPABILITY,
  HR_PER_COMPENSATION_READ_CAPABILITY,
  HR_PER_READ_CAPABILITY,
  HR_PER_WRITE_CAPABILITY,
};
