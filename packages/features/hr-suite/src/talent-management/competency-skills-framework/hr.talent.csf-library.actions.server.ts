"use server";

import {
  requireExecutionContext,
  requireExecutionPermission,
} from "@afenda/kernel/execution";

import {
  createHrCsfCompetency,
  createHrCsfSkill,
  getHrCsfCompetencyDetail,
  getHrCsfSkillDetail,
  listHrCsfCompetencies,
  listHrCsfSkills,
  updateHrCsfCompetency,
  updateHrCsfSkill,
} from "./hrs-hr-talent-csf-library-server";
import {
  HR_CSF_READ_CAPABILITY,
  HR_CSF_WRITE_CAPABILITY,
} from "./hr.talent.csf-constants.shared";
import {
  hrCsfCreateCompetencySchema,
  hrCsfCreateSkillSchema,
  hrCsfUpdateCompetencySchema,
  hrCsfUpdateSkillSchema,
} from "./hr.talent.csf-mutation.schema";

async function requireHrCsfRead() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, HR_CSF_READ_CAPABILITY);
  return {
    organizationId: context.organizationId,
    actorUserId: context.userId,
  };
}

async function requireHrCsfWrite() {
  const context = await requireExecutionContext();
  requireExecutionPermission(context, HR_CSF_WRITE_CAPABILITY);
  return {
    organizationId: context.organizationId,
    actorUserId: context.userId,
  };
}

export async function listCsfCompetenciesAction(input?: {
  search?: string;
  category?: string;
  libraryStatus?: string;
  limit?: number;
  offset?: number;
}) {
  const guard = await requireHrCsfRead();
  return listHrCsfCompetencies({
    organizationId: guard.organizationId,
    search: input?.search,
    category: input?.category as Parameters<
      typeof listHrCsfCompetencies
    >[0]["category"],
    libraryStatus: input?.libraryStatus as Parameters<
      typeof listHrCsfCompetencies
    >[0]["libraryStatus"],
    limit: input?.limit,
    offset: input?.offset,
  });
}

export async function getCsfCompetencyAction(competencyId: string) {
  const guard = await requireHrCsfRead();
  return getHrCsfCompetencyDetail({
    organizationId: guard.organizationId,
    competencyId,
  });
}

export async function createCsfCompetencyAction(input: unknown) {
  const guard = await requireHrCsfWrite();
  const parsed = hrCsfCreateCompetencySchema.parse(input);
  return createHrCsfCompetency({
    organizationId: guard.organizationId,
    actorUserId: guard.actorUserId,
    payload: parsed,
  });
}

export async function updateCsfCompetencyAction(input: unknown) {
  const guard = await requireHrCsfWrite();
  const parsed = hrCsfUpdateCompetencySchema.parse(input);
  return updateHrCsfCompetency({
    organizationId: guard.organizationId,
    actorUserId: guard.actorUserId,
    payload: parsed,
  });
}

export async function listCsfSkillsAction(input?: {
  search?: string;
  category?: string;
  libraryStatus?: string;
  limit?: number;
  offset?: number;
}) {
  const guard = await requireHrCsfRead();
  return listHrCsfSkills({
    organizationId: guard.organizationId,
    search: input?.search,
    category: input?.category as Parameters<typeof listHrCsfSkills>[0]["category"],
    libraryStatus: input?.libraryStatus as Parameters<
      typeof listHrCsfSkills
    >[0]["libraryStatus"],
    limit: input?.limit,
    offset: input?.offset,
  });
}

export async function getCsfSkillAction(skillId: string) {
  const guard = await requireHrCsfRead();
  return getHrCsfSkillDetail({
    organizationId: guard.organizationId,
    skillId,
  });
}

export async function createCsfSkillAction(input: unknown) {
  const guard = await requireHrCsfWrite();
  const parsed = hrCsfCreateSkillSchema.parse(input);
  return createHrCsfSkill({
    organizationId: guard.organizationId,
    actorUserId: guard.actorUserId,
    payload: parsed,
  });
}

export async function updateCsfSkillAction(input: unknown) {
  const guard = await requireHrCsfWrite();
  const parsed = hrCsfUpdateSkillSchema.parse(input);
  return updateHrCsfSkill({
    organizationId: guard.organizationId,
    actorUserId: guard.actorUserId,
    payload: parsed,
  });
}
