import type { AppCapability } from "@afenda/auth";
import { resolveEmployeeIdsVisibleToActor } from "@afenda/db";
import {
  hasExecutionPermission,
  requireExecutionContext,
  requireExecutionPermission,
  type ExecutionContext,
} from "@afenda/kernel/execution";

import {
  HR_PER_APPROVE_CAPABILITY,
  HR_PER_AUDIT_READ_CAPABILITY,
  HR_PER_CALIBRATE_CAPABILITY,
  HR_PER_COMPENSATION_READ_CAPABILITY,
  HR_PER_READ_CAPABILITY,
  HR_PER_WRITE_CAPABILITY,
} from "../schemas/hr.talent.performance-constants.shared";
import { isPerformanceReviewLocked } from "../data/hr.talent.performance-store.shared";

export type HrPerformanceAccessScope = "self" | "team" | "org";

export type HrPerformanceExecutionGuard = {
  context: ExecutionContext;
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
  context: ExecutionContext,
): HrPerformanceExecutionGuard {
  const canReadPerformance = hasExecutionPermission(
    context,
    HR_PER_READ_CAPABILITY,
  );
  const canWritePerformance = hasExecutionPermission(
    context,
    HR_PER_WRITE_CAPABILITY,
  );
  const canApprovePerformance = hasExecutionPermission(
    context,
    HR_PER_APPROVE_CAPABILITY,
  );
  const canCalibratePerformance = hasExecutionPermission(
    context,
    HR_PER_CALIBRATE_CAPABILITY,
  );
  const canReadAudit = hasExecutionPermission(
    context,
    HR_PER_AUDIT_READ_CAPABILITY,
  );
  const canReadCompensationOutcome = hasExecutionPermission(
    context,
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
      return hasExecutionPermission(context, capability);
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
  const context = await requireExecutionContext();
  requireExecutionPermission(context, HR_PER_READ_CAPABILITY);
  return toHrPerformanceExecutionGuard(context);
}

export async function requireHrPerformanceWrite() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, HR_PER_WRITE_CAPABILITY);
  return toHrPerformanceExecutionGuard(context);
}

export async function requireHrPerformanceApprove() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, HR_PER_APPROVE_CAPABILITY);
  return toHrPerformanceExecutionGuard(context);
}

export function canHrPerformanceEditReview(
  guard: HrPerformanceExecutionGuard,
  review: { status: string; lockedAt: string | null },
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
