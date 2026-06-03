import {
  createHrCsfCompetencyInTx,
  createHrCsfSkillInTx,
  getHrCsfCompetencySummary,
  getHrCsfSkillSummary,
  listHrCsfCompetenciesWindow,
  listHrCsfSkillsWindow,
  updateHrCsfCompetencyInTx,
  updateHrCsfSkillInTx,
} from "@afenda/db";

import type {
  HrCsfCompetencySummary,
  HrCsfSkillSummary,
} from "./hr.talent.csf-library.contract";
import type {
  HrCsfCreateCompetencyInput,
  HrCsfCreateSkillInput,
  HrCsfUpdateCompetencyInput,
  HrCsfUpdateSkillInput,
} from "./hr.talent.csf-mutation.schema";

const CSF_DEFAULT_PAGE_SIZE = 25;

export async function listHrCsfCompetencies(input: {
  organizationId: string;
  search?: string;
  category?: HrCsfCreateCompetencyInput["category"];
  libraryStatus?: HrCsfCreateCompetencyInput["libraryStatus"];
  limit?: number;
  offset?: number;
}) {
  return listHrCsfCompetenciesWindow({
    organizationId: input.organizationId,
    search: input.search,
    category: input.category,
    libraryStatus: input.libraryStatus,
    limit: input.limit ?? CSF_DEFAULT_PAGE_SIZE,
    offset: input.offset,
  });
}

export async function listHrCsfSkills(input: {
  organizationId: string;
  search?: string;
  category?: HrCsfCreateSkillInput["category"];
  libraryStatus?: HrCsfCreateSkillInput["libraryStatus"];
  limit?: number;
  offset?: number;
}) {
  return listHrCsfSkillsWindow({
    organizationId: input.organizationId,
    search: input.search,
    category: input.category,
    libraryStatus: input.libraryStatus,
    limit: input.limit ?? CSF_DEFAULT_PAGE_SIZE,
    offset: input.offset,
  });
}

export async function getHrCsfCompetencyDetail(input: {
  organizationId: string;
  competencyId: string;
}): Promise<HrCsfCompetencySummary | null> {
  return getHrCsfCompetencySummary(input);
}

export async function getHrCsfSkillDetail(input: {
  organizationId: string;
  skillId: string;
}): Promise<HrCsfSkillSummary | null> {
  return getHrCsfSkillSummary(input);
}

export async function createHrCsfCompetency(input: {
  organizationId: string;
  actorUserId: string;
  payload: HrCsfCreateCompetencyInput;
}) {
  const { runWithOrganizationContext } = await import("@afenda/db");
  return runWithOrganizationContext(input.organizationId, async (db) =>
    createHrCsfCompetencyInTx(db, {
      organizationId: input.organizationId,
      actorUserId: input.actorUserId,
      ...input.payload,
    }),
  );
}

export async function updateHrCsfCompetency(input: {
  organizationId: string;
  actorUserId: string;
  payload: HrCsfUpdateCompetencyInput;
}) {
  const { runWithOrganizationContext } = await import("@afenda/db");
  const { competencyId, ...updates } = input.payload;
  return runWithOrganizationContext(input.organizationId, async (db) =>
    updateHrCsfCompetencyInTx(db, {
      organizationId: input.organizationId,
      actorUserId: input.actorUserId,
      competencyId,
      ...updates,
    }),
  );
}

export async function createHrCsfSkill(input: {
  organizationId: string;
  actorUserId: string;
  payload: HrCsfCreateSkillInput;
}) {
  const { runWithOrganizationContext } = await import("@afenda/db");
  return runWithOrganizationContext(input.organizationId, async (db) =>
    createHrCsfSkillInTx(db, {
      organizationId: input.organizationId,
      actorUserId: input.actorUserId,
      ...input.payload,
    }),
  );
}

export async function updateHrCsfSkill(input: {
  organizationId: string;
  actorUserId: string;
  payload: HrCsfUpdateSkillInput;
}) {
  const { runWithOrganizationContext } = await import("@afenda/db");
  const { skillId, ...updates } = input.payload;
  return runWithOrganizationContext(input.organizationId, async (db) =>
    updateHrCsfSkillInTx(db, {
      organizationId: input.organizationId,
      actorUserId: input.actorUserId,
      skillId,
      ...updates,
    }),
  );
}
