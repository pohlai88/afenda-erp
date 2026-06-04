import type { AppCapability } from "@afenda/kernel";
import {
  resolveEmployeeIdsVisibleToActor,
  resolveHrEmployeeIdsForAuthUser,
} from "@afenda/db";
import {
  hasExecutionPermission,
  requireExecutionContext,
  requireExecutionPermission,
  type ExecutionContext,
} from "@afenda/kernel/execution";

import {
  HR_TALENT_CAREER_PATH_READ_CAPABILITY,
  HR_TALENT_CAREER_PATH_WRITE_CAPABILITY,
} from "./hr.talent.career-pathing-constants.shared";

export type HrCareerPathAccessScope = "self" | "team" | "org";

export class HrCareerPathAccessDeniedError extends Error {
  constructor(message = "Career pathing access denied.") {
    super(message);
    this.name = "HrCareerPathAccessDeniedError";
  }
}

export type HrCareerPathingExecutionGuard = {
  context: ExecutionContext;
  session: { id: string };
  organization: {
    id: string;
    slug: string;
    locale: string;
    role: ExecutionContext["role"];
    capabilities: readonly AppCapability[];
  };
  canWrite: boolean;
  canReadReadiness: boolean;
  isAuditor: boolean;
  selfEmployeeIds: readonly string[];
  hasCapability(capability: AppCapability): boolean;
  resolveVisibleEmployeeIds(input: {
    scope: HrCareerPathAccessScope;
    selfEmployeeId?: string | null;
  }): Promise<readonly string[] | null>;
  assertEmployeeVisible(employeeId: string): Promise<void>;
  assertCanRecommendTargetRole(): void;
};

function toHrCareerPathingExecutionGuard(
  context: ExecutionContext,
  selfEmployeeIds: readonly string[],
): HrCareerPathingExecutionGuard {
  const canWrite = hasExecutionPermission(
    context,
    HR_TALENT_CAREER_PATH_WRITE_CAPABILITY,
  );
  const canReadReadiness =
    hasExecutionPermission(context, HR_TALENT_CAREER_PATH_READ_CAPABILITY) &&
    (canWrite || hasExecutionPermission(context, "system-admin.audit.read"));
  const isAuditor = hasExecutionPermission(context, "system-admin.audit.read");

  return {
    context,
    session: { id: context.userId },
    organization: {
      id: context.organizationId,
      slug: context.organizationSlug,
      locale: context.locale,
      role: context.role,
      capabilities: context.capabilities,
    },
    canWrite,
    canReadReadiness,
    isAuditor,
    selfEmployeeIds,
    hasCapability(capability: AppCapability) {
      return hasExecutionPermission(context, capability);
    },
    async resolveVisibleEmployeeIds(scopeInput) {
      const scope =
        scopeInput.scope === "org" && !canWrite ? "team" : scopeInput.scope;
      return resolveEmployeeIdsVisibleToActor({
        organizationId: context.organizationId,
        actorAuthUserId: context.userId,
        scope,
        selfEmployeeId: scopeInput.selfEmployeeId,
      });
    },
    async assertEmployeeVisible(employeeId) {
      const visible = await this.resolveVisibleEmployeeIds({ scope: "org" });
      if (visible === null) {
        return;
      }
      if (!visible.includes(employeeId)) {
        throw new HrCareerPathAccessDeniedError();
      }
    },
    assertCanRecommendTargetRole() {
      if (!canWrite) {
        throw new HrCareerPathAccessDeniedError(
          "Manager or HR write permission required to recommend target roles.",
        );
      }
    },
  };
}

async function buildCareerPathingGuard(context: ExecutionContext) {
  const selfEmployeeIds = await resolveHrEmployeeIdsForAuthUser({
    organizationId: context.organizationId,
    authUserId: context.userId,
  });
  return toHrCareerPathingExecutionGuard(context, selfEmployeeIds);
}

/** HRM-CAR-030 partial — employee, manager, HR, mentor, coach, auditor gates. */
export async function requireHrCareerPathingRead() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, HR_TALENT_CAREER_PATH_READ_CAPABILITY);
  return buildCareerPathingGuard(context);
}

export async function requireHrCareerPathingWrite() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, HR_TALENT_CAREER_PATH_WRITE_CAPABILITY);
  return buildCareerPathingGuard(context);
}

export const requireHrTalentCareerPathRead = requireHrCareerPathingRead;
export const requireHrTalentCareerPathWrite = requireHrCareerPathingWrite;

export async function requireHrTalentCareerPathSelfWrite(employeeId: string) {
  const guard = await requireHrCareerPathingRead();
  if (guard.canWrite) {
    return guard;
  }
  if (!guard.selfEmployeeIds.includes(employeeId)) {
    throw new HrCareerPathAccessDeniedError(
      "Employees may only update their own career aspirations.",
    );
  }
  return guard;
}

export function canHrCareerPathingViewEmployee(
  guard: HrCareerPathingExecutionGuard,
  employeeId: string,
): boolean {
  if (guard.canWrite || guard.isAuditor) {
    return true;
  }
  return guard.selfEmployeeIds.includes(employeeId);
}

export function canHrCareerPathingViewReadiness(
  guard: HrCareerPathingExecutionGuard,
): boolean {
  return guard.canReadReadiness;
}

export function canHrCareerPathingModifyPlan(
  guard: HrCareerPathingExecutionGuard,
): boolean {
  return guard.canWrite;
}

export {
  HR_TALENT_CAREER_PATH_READ_CAPABILITY,
  HR_TALENT_CAREER_PATH_WRITE_CAPABILITY,
};

export const HR_CAREER_READ_CAPABILITY = HR_TALENT_CAREER_PATH_READ_CAPABILITY;
export const HR_CAREER_WRITE_CAPABILITY = HR_TALENT_CAREER_PATH_WRITE_CAPABILITY;

export type HrCareerPathExecutionGuard = HrCareerPathingExecutionGuard;
