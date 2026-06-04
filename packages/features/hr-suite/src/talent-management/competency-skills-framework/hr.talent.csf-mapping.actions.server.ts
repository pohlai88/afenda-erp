"use server";

import {
  requireExecutionContext,
  requireExecutionPermission,
} from "@afenda/kernel/execution";

import {
  createHrCsfProficiencyScale,
  getHrCsfProficiencyScaleDetail,
  listHrCsfProficiencyScales,
  updateHrCsfProficiencyScale,
} from "./hrs-hr-talent-csf-proficiency-server";
import {
  deleteHrCsfCompetencyRequirement,
  deleteHrCsfSkillRequirement,
  listHrCsfCompetencyRequirements,
  listHrCsfSkillRequirements,
  upsertHrCsfCompetencyRequirement,
  upsertHrCsfSkillRequirement,
} from "./hrs-hr-talent-csf-role-mapping-server";
import {
  HR_CSF_READ_CAPABILITY,
  HR_CSF_WRITE_CAPABILITY,
} from "./hr.talent.csf-constants.shared";
import {
  hrCsfCompetencyRequirementSchema,
  hrCsfCreateProficiencyScaleSchema,
  hrCsfDeleteRequirementSchema,
  hrCsfSkillRequirementSchema,
  hrCsfUpdateProficiencyScaleSchema,
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

export async function listCsfProficiencyScalesAction(input?: {
  search?: string;
  scaleStatus?: string;
  limit?: number;
  offset?: number;
}) {
  const guard = await requireHrCsfRead();
  return listHrCsfProficiencyScales({
    organizationId: guard.organizationId,
    search: input?.search,
    scaleStatus: input?.scaleStatus as Parameters<
      typeof listHrCsfProficiencyScales
    >[0]["scaleStatus"],
    limit: input?.limit,
    offset: input?.offset,
  });
}

export async function getCsfProficiencyScaleAction(scaleId: string) {
  const guard = await requireHrCsfRead();
  return getHrCsfProficiencyScaleDetail({
    organizationId: guard.organizationId,
    scaleId,
  });
}

export async function createCsfProficiencyScaleAction(input: unknown) {
  const guard = await requireHrCsfWrite();
  const parsed = hrCsfCreateProficiencyScaleSchema.parse(input);
  return createHrCsfProficiencyScale({
    organizationId: guard.organizationId,
    actorUserId: guard.actorUserId,
    payload: parsed,
  });
}

export async function updateCsfProficiencyScaleAction(input: unknown) {
  const guard = await requireHrCsfWrite();
  const parsed = hrCsfUpdateProficiencyScaleSchema.parse(input);
  return updateHrCsfProficiencyScale({
    organizationId: guard.organizationId,
    actorUserId: guard.actorUserId,
    payload: parsed,
  });
}

export async function listCsfCompetencyRequirementsAction(input?: {
  competencyId?: string;
  scope?: string;
  scopeRef?: string;
  limit?: number;
  offset?: number;
}) {
  const guard = await requireHrCsfRead();
  return listHrCsfCompetencyRequirements({
    organizationId: guard.organizationId,
    competencyId: input?.competencyId,
    scope: input?.scope as Parameters<
      typeof listHrCsfCompetencyRequirements
    >[0]["scope"],
    scopeRef: input?.scopeRef,
    limit: input?.limit,
    offset: input?.offset,
  });
}

export async function listCsfSkillRequirementsAction(input?: {
  skillId?: string;
  scope?: string;
  scopeRef?: string;
  requirementClass?: string;
  limit?: number;
  offset?: number;
}) {
  const guard = await requireHrCsfRead();
  return listHrCsfSkillRequirements({
    organizationId: guard.organizationId,
    skillId: input?.skillId,
    scope: input?.scope as Parameters<
      typeof listHrCsfSkillRequirements
    >[0]["scope"],
    scopeRef: input?.scopeRef,
    requirementClass: input?.requirementClass as Parameters<
      typeof listHrCsfSkillRequirements
    >[0]["requirementClass"],
    limit: input?.limit,
    offset: input?.offset,
  });
}

export async function upsertCsfCompetencyRequirementAction(input: unknown) {
  const guard = await requireHrCsfWrite();
  const parsed = hrCsfCompetencyRequirementSchema.parse(input);
  return upsertHrCsfCompetencyRequirement({
    organizationId: guard.organizationId,
    actorUserId: guard.actorUserId,
    payload: parsed,
  });
}

export async function upsertCsfSkillRequirementAction(input: unknown) {
  const guard = await requireHrCsfWrite();
  const parsed = hrCsfSkillRequirementSchema.parse(input);
  return upsertHrCsfSkillRequirement({
    organizationId: guard.organizationId,
    actorUserId: guard.actorUserId,
    payload: parsed,
  });
}

export async function deleteCsfCompetencyRequirementAction(input: unknown) {
  const guard = await requireHrCsfWrite();
  const parsed = hrCsfDeleteRequirementSchema.parse(input);
  return deleteHrCsfCompetencyRequirement({
    organizationId: guard.organizationId,
    actorUserId: guard.actorUserId,
    requirementId: parsed.requirementId,
  });
}

export async function deleteCsfSkillRequirementAction(input: unknown) {
  const guard = await requireHrCsfWrite();
  const parsed = hrCsfDeleteRequirementSchema.parse(input);
  return deleteHrCsfSkillRequirement({
    organizationId: guard.organizationId,
    actorUserId: guard.actorUserId,
    requirementId: parsed.requirementId,
  });
}
