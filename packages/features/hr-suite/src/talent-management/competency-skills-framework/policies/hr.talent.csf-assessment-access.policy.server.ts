import type { AppCapability } from "@afenda/auth";
import {
  getUserProfile,
  resolveEmployeeIdsVisibleToActor,
  resolveHrEmployeeIdsForAuthUser,
} from "@afenda/db";
import {
  requireExecutionPermission,
} from "@afenda/kernel/execution";

import {
  HR_CSF_ASSESS_MANAGER_CAPABILITY,
  HR_CSF_ASSESS_SELF_CAPABILITY,
  HR_CSF_ASSESS_VALIDATE_CAPABILITY,
} from "../schemas/hr.talent.csf-constants.shared";
import {
  requireHrCsfRead,
  type HrCsfExecutionGuard,
} from "./hr.talent.csf-access.policy.server";

export class HrCsfAssessmentAccessDeniedError extends Error {
  constructor(message = "Access denied for competency assessment.") {
    super(message);
    this.name = "HrCsfAssessmentAccessDeniedError";
  }
}

export type HrCsfAssessmentExecutionGuard = {
  guard: HrCsfExecutionGuard;
  session: { id: string };
  organization: HrCsfExecutionGuard["organization"];
  actorEmployeeIds: readonly string[];
  canAssessSelf: boolean;
  canAssessManager: boolean;
  canValidate: boolean;
  hasCapability(capability: AppCapability): boolean;
  assertEmployeeAccess(employeeId: string): Promise<void>;
  assertSelfAssessmentTarget(employeeId: string): Promise<void>;
  assertManagerAssessmentTarget(employeeId: string): Promise<void>;
};

async function resolveActorEmployeeIds(
  guard: HrCsfExecutionGuard,
): Promise<readonly string[]> {
  const profile = await getUserProfile(guard.session.id);
  return resolveHrEmployeeIdsForAuthUser({
    organizationId: guard.organization.id,
    authUserId: guard.session.id,
    authUserEmail: profile?.email ?? null,
  });
}

async function buildHrCsfAssessmentExecutionGuard(
  guard: HrCsfExecutionGuard,
): Promise<HrCsfAssessmentExecutionGuard> {
  const actorEmployeeIds = await resolveActorEmployeeIds(guard);

  return {
    guard,
    session: guard.session,
    organization: guard.organization,
    actorEmployeeIds,
    canAssessSelf: guard.hasCapability(HR_CSF_ASSESS_SELF_CAPABILITY),
    canAssessManager: guard.hasCapability(HR_CSF_ASSESS_MANAGER_CAPABILITY),
    canValidate: guard.hasCapability(HR_CSF_ASSESS_VALIDATE_CAPABILITY),
    hasCapability(capability: AppCapability) {
      return guard.hasCapability(capability);
    },
    async assertEmployeeAccess(employeeId: string) {
      const visible = await guard.resolveVisibleEmployeeIds({
        scope: guard.canWriteCsf ? "org" : "team",
        selfEmployeeId: actorEmployeeIds[0] ?? null,
      });
      if (guard.canWriteCsf || visible === null || visible.includes(employeeId)) {
        return;
      }
      throw new HrCsfAssessmentAccessDeniedError();
    },
    async assertSelfAssessmentTarget(employeeId: string) {
      if (!guard.hasCapability(HR_CSF_ASSESS_SELF_CAPABILITY)) {
        throw new HrCsfAssessmentAccessDeniedError();
      }
      if (!actorEmployeeIds.includes(employeeId)) {
        throw new HrCsfAssessmentAccessDeniedError(
          "Self-assessment is limited to the signed-in employee.",
        );
      }
    },
    async assertManagerAssessmentTarget(employeeId: string) {
      if (!guard.hasCapability(HR_CSF_ASSESS_MANAGER_CAPABILITY)) {
        throw new HrCsfAssessmentAccessDeniedError();
      }
      const visible = await resolveEmployeeIdsVisibleToActor({
        organizationId: guard.organization.id,
        actorAuthUserId: guard.session.id,
        scope: "team",
        selfEmployeeId: actorEmployeeIds[0] ?? null,
      });
      if (visible !== null && !visible.includes(employeeId)) {
        throw new HrCsfAssessmentAccessDeniedError(
          "Manager assessment is limited to direct reports.",
        );
      }
    },
  };
}

export async function requireHrCsfSelfAssess(): Promise<HrCsfAssessmentExecutionGuard> {
  const guard = await requireHrCsfRead();
  requireExecutionPermission(guard.context, HR_CSF_ASSESS_SELF_CAPABILITY);
  return buildHrCsfAssessmentExecutionGuard(guard);
}

export async function requireHrCsfManagerAssess(): Promise<HrCsfAssessmentExecutionGuard> {
  const guard = await requireHrCsfRead();
  requireExecutionPermission(guard.context, HR_CSF_ASSESS_MANAGER_CAPABILITY);
  return buildHrCsfAssessmentExecutionGuard(guard);
}

export async function requireHrCsfValidateAssess(): Promise<HrCsfAssessmentExecutionGuard> {
  const guard = await requireHrCsfRead();
  requireExecutionPermission(guard.context, HR_CSF_ASSESS_VALIDATE_CAPABILITY);
  return buildHrCsfAssessmentExecutionGuard(guard);
}

export {
  HR_CSF_ASSESS_SELF_CAPABILITY,
  HR_CSF_ASSESS_MANAGER_CAPABILITY,
  HR_CSF_ASSESS_VALIDATE_CAPABILITY,
};
