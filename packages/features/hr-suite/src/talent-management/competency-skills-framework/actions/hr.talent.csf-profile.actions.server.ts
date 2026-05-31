"use server";

import { runWithOrganizationContext } from "@afenda/db";

import {
  canHrCsfViewEmployeeProfile,
  requireHrCsfRead,
  requireHrCsfWrite,
} from "../policies/hr.talent.csf-access.policy.server";
import {
  hrCsfListEmployeeProfilesSchema,
  hrCsfUpsertCompetencyProfileSchema,
  hrCsfUpsertSkillProfileSchema,
} from "../schemas/hr.talent.csf-profile.schema";

async function assertProfileWriteAccess(
  guard: Awaited<ReturnType<typeof requireHrCsfWrite>>,
  employeeId: string,
) {
  const visible = await guard.resolveVisibleEmployeeIds({
    scope: "org",
    selfEmployeeId: null,
  });
  if (!canHrCsfViewEmployeeProfile(guard, employeeId, visible)) {
    throw new Error("Access denied for employee profile mutation.");
  }
}

export async function upsertHrTalentCsfCompetencyProfileAction(input: unknown) {
  const guard = await requireHrCsfWrite();
  const parsed = hrCsfUpsertCompetencyProfileSchema.parse(input);
  await assertProfileWriteAccess(guard, parsed.employeeId);

  return runWithOrganizationContext(guard.organization.id, async (db) => {
    const { upsertHrCsfEmployeeCompetencyProfileInTx } = await import(
      "@afenda/db/hr-competency-skills-profiles"
    );
    return upsertHrCsfEmployeeCompetencyProfileInTx(db, {
      organizationId: guard.organization.id,
      actorUserId: guard.session.id,
      ...parsed,
    });
  });
}

export async function upsertHrTalentCsfSkillProfileAction(input: unknown) {
  const guard = await requireHrCsfWrite();
  const parsed = hrCsfUpsertSkillProfileSchema.parse(input);
  await assertProfileWriteAccess(guard, parsed.employeeId);

  return runWithOrganizationContext(guard.organization.id, async (db) => {
    const { upsertHrCsfEmployeeSkillProfileInTx } = await import(
      "@afenda/db/hr-competency-skills-profiles"
    );
    return upsertHrCsfEmployeeSkillProfileInTx(db, {
      organizationId: guard.organization.id,
      actorUserId: guard.session.id,
      ...parsed,
    });
  });
}

export async function listHrTalentCsfCompetencyProfilesAction(input: unknown) {
  const guard = await requireHrCsfRead();
  const parsed = hrCsfListEmployeeProfilesSchema.parse(input);
  const visible = await guard.resolveVisibleEmployeeIds({
    scope: guard.canWriteCsf ? "org" : "team",
    selfEmployeeId: null,
  });
  if (!canHrCsfViewEmployeeProfile(guard, parsed.employeeId, visible)) {
    throw new Error("Access denied for employee competency profiles.");
  }

  const { listHrCsfEmployeeCompetencyProfiles } = await import(
    "@afenda/db/hr-competency-skills-profiles"
  );
  return listHrCsfEmployeeCompetencyProfiles({
    organizationId: guard.organization.id,
    employeeId: parsed.employeeId,
  });
}

export async function listHrTalentCsfSkillProfilesAction(input: unknown) {
  const guard = await requireHrCsfRead();
  const parsed = hrCsfListEmployeeProfilesSchema.parse(input);
  const visible = await guard.resolveVisibleEmployeeIds({
    scope: guard.canWriteCsf ? "org" : "team",
    selfEmployeeId: null,
  });
  if (!canHrCsfViewEmployeeProfile(guard, parsed.employeeId, visible)) {
    throw new Error("Access denied for employee skill profiles.");
  }

  const { listHrCsfEmployeeSkillProfiles } = await import(
    "@afenda/db/hr-competency-skills-profiles"
  );
  return listHrCsfEmployeeSkillProfiles({
    organizationId: guard.organization.id,
    employeeId: parsed.employeeId,
  });
}
