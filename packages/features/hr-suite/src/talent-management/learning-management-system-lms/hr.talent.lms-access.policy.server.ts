import type { AppCapability } from "@afenda/auth";
import { resolveEmployeeIdsVisibleToActor } from "@afenda/db";
import {
  hasExecutionPermission,
  requireExecutionContext,
  requireExecutionPermission,
  type ExecutionContext,
} from "@afenda/kernel/execution";

import {
  HR_LMS_READ_CAPABILITY,
  HR_LMS_WRITE_CAPABILITY,
} from "./hr.talent.lms-constants.shared";

export type HrLmsAccessScope = "self" | "team" | "org";

export type HrLmsExecutionGuard = {
  context: ExecutionContext;
  canWriteLms: boolean;
  canReadAudit: boolean;
  canViewTeamProgress: boolean;
  canViewOrgAdmin: boolean;
  hasCapability(capability: AppCapability): boolean;
  resolveVisibleEmployeeIds(input: {
    scope: HrLmsAccessScope;
    selfEmployeeId?: string | null;
  }): Promise<readonly string[] | null>;
};

function toHrLmsExecutionGuard(context: ExecutionContext): HrLmsExecutionGuard {
  const canReadLms = hasExecutionPermission(context, HR_LMS_READ_CAPABILITY);
  const canWriteLms = hasExecutionPermission(context, HR_LMS_WRITE_CAPABILITY);
  const isLeadership =
    context.role === "owner" || context.role === "admin" || canWriteLms;

  return {
    context,
    canWriteLms,
    canReadAudit: canReadLms && (canWriteLms || isLeadership),
    canViewTeamProgress: canReadLms && (canWriteLms || isLeadership),
    canViewOrgAdmin: canReadLms && canWriteLms,
    hasCapability(capability: AppCapability) {
      return hasExecutionPermission(context, capability);
    },
    async resolveVisibleEmployeeIds(scopeInput) {
      if (!canReadLms) {
        return [];
      }

      let scope = scopeInput.scope;
      if (scope === "org" && !canWriteLms && !isLeadership) {
        scope = "team";
      }
      if (scope === "team" && !canWriteLms && context.role === "staff") {
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

/** HRM-LMS-028 — role/permission gate for LMS reads. */
export async function requireHrLmsRead() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, HR_LMS_READ_CAPABILITY);
  return toHrLmsExecutionGuard(context);
}

export async function requireHrLmsWrite() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, HR_LMS_WRITE_CAPABILITY);
  return toHrLmsExecutionGuard(context);
}

export function canHrLmsViewEmployeeLearning(
  guard: HrLmsExecutionGuard,
  employeeId: string,
  visibleEmployeeIds: readonly string[] | null,
): boolean {
  if (guard.canWriteLms) {
    return true;
  }
  if (!visibleEmployeeIds) {
    return true;
  }
  return visibleEmployeeIds.includes(employeeId);
}

export function canHrLmsModifyLearningRecord(guard: HrLmsExecutionGuard): boolean {
  return guard.canWriteLms;
}

export {
  HR_LMS_READ_CAPABILITY,
  HR_LMS_WRITE_CAPABILITY,
};
