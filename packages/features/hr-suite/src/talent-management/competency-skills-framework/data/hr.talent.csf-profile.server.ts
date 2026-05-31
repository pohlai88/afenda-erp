import {
  listHrCsfEmployeeCompetencyProfiles,
  listHrCsfEmployeeSkillProfiles,
} from "@afenda/db";

import {
  canHrCsfViewEmployeeProfile,
  requireHrCsfRead,
  requireHrCsfWrite,
} from "../policies/hr.talent.csf-access.policy.server";
import { hrCsfListEmployeeProfilesSchema } from "../schemas/hr.talent.csf-profile.schema";

async function assertProfileReadAccess(
  guard: Awaited<ReturnType<typeof requireHrCsfRead>>,
  employeeId: string,
) {
  const visible = await guard.resolveVisibleEmployeeIds({
    scope: guard.canWriteCsf ? "org" : "team",
    selfEmployeeId: null,
  });
  if (!canHrCsfViewEmployeeProfile(guard, employeeId, visible)) {
    throw new Error("Access denied for employee competency profile.");
  }
}

export async function listHrTalentCsfEmployeeCompetencyProfiles(input: unknown) {
  const guard = await requireHrCsfRead();
  const parsed = hrCsfListEmployeeProfilesSchema.parse(input);
  await assertProfileReadAccess(guard, parsed.employeeId);

  return listHrCsfEmployeeCompetencyProfiles({
    organizationId: guard.organization.id,
    employeeId: parsed.employeeId,
  });
}

export async function listHrTalentCsfEmployeeSkillProfiles(input: unknown) {
  const guard = await requireHrCsfRead();
  const parsed = hrCsfListEmployeeProfilesSchema.parse(input);
  await assertProfileReadAccess(guard, parsed.employeeId);

  return listHrCsfEmployeeSkillProfiles({
    organizationId: guard.organization.id,
    employeeId: parsed.employeeId,
  });
}

export async function canHrTalentCsfManageProfiles() {
  const guard = await requireHrCsfWrite();
  return {
    organizationId: guard.organization.id,
    canWrite: guard.canWriteCsf,
  };
}
